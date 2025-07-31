use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap, StableCell, Storable,
};
use candle_nn::{optim, Conv2d, linear, Optimizer, loss, VarMap, VarBuilder, Activation};
use crate::storage;
use candle_transformers::models::bert::{HiddenAct as OtherHiddenAct};
use std::cell::RefCell;
use serde::{Serialize, Deserialize};
use candid::CandidType;
use candle_transformers::models::rwkv_v6::Tokenizer;
use ic_cdk::init;
use candid::arc::deserialize;
use std::collections::HashMap;
use candle_nn::{layer_norm, embedding};
use candle_nn::ops::softmax;
use once_cell::sync::OnceCell;
use candle_core::{Module, Result as CandleResult, DType, Device, Tensor, IndexOp, Error as CandleError, safetensors};
use candle_nn::{Linear, Embedding, LayerNorm};
// use candle_core::safetensors;
use std::path::Path;


const DEVICE: Device = Device::Cpu;

const WASI_MEMORY_ID: MemoryId = MemoryId::new(2);

// Files in the WASI filesystem (in the stable memory) that store the models.
const BIOGPT_RECCOMMENDATION: &str = "biogpt_model.safetensors";
const BIOGPT_CONFIG: &str = "bioGPT_config.json";

type Memory3 = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    // The memory manager for stable memory.
    pub static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );
    // Storage for the file system.
    pub static FILE_STORAGE: RefCell<Vec<u8>> = RefCell::default();
}

// A global OnceCell to hold the initialized canister state, ensuring it's loaded only once.
static CANISTER_STATE: OnceCell<CanisterState> = OnceCell::new();

#[ic_cdk::update]
fn append_biogpt_model_bytes(bytes: Vec<u8>) {
    storage::append_bytes(BIOGPT_RECCOMMENDATION.to_string(), bytes);
}

#[ic_cdk::update]
fn append_biogpt_config_bytes(bytes: Vec<u8>) {
    storage::append_bytes(BIOGPT_CONFIG.to_string(), bytes);
}

#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
pub struct BioGptConfig {
    pub activation_dropout: f32,
    pub architectures: Vec<String>,
    pub attention_probs_dropout_prob: f32,
    pub bos_token_id: usize,
    pub eos_token_id: usize,
    pub hidden_act: String,
    pub hidden_dropout_prob: f32,
    pub hidden_size: usize,
    pub initializer_range: f32,
    pub intermediate_size: usize,
    pub is_decoder: bool,
    pub layer_norm_eps: f64,
    pub layerdrop: f32,
    pub max_position_embeddings: usize,
    pub model_type: String,
    pub num_attention_heads: usize,
    pub num_hidden_layers: usize,
    pub pad_token_id: usize,
    pub scale_embedding: bool,
    pub torch_dtype: String,
    pub transformers_version: String,
    pub type_vocab_size: usize,
    pub use_cache: bool,
    pub vocab_size: usize,
}

#[derive(Debug)]
pub struct Attention {
    q_proj: candle_nn::Linear,
    k_proj: candle_nn::Linear,
    v_proj: candle_nn::Linear,
    out_proj: candle_nn::Linear,
    num_heads: usize,
}

impl Attention {
    /// Loads the attention layer's weights from a `VarBuilder`.
    pub fn load(vb: VarBuilder<'_>, cfg: &BioGptConfig) -> CandleResult<Self> {
        let q_proj = linear(cfg.hidden_size, cfg.hidden_size, vb.pp("q_proj"))?;
        let k_proj = linear(cfg.hidden_size, cfg.hidden_size, vb.pp("k_proj"))?;
        let v_proj = linear(cfg.hidden_size, cfg.hidden_size, vb.pp("v_proj"))?;
        let out_proj = linear(cfg.hidden_size, cfg.hidden_size, vb.pp("out_proj"))?;

        Ok(Self {
            q_proj,
            k_proj,
            v_proj,
            out_proj,
            num_heads: cfg.num_attention_heads,
        })
    }

    /// Performs a forward pass through the attention layer.
    pub fn forward(&self, x: &Tensor) -> CandleResult<Tensor> {
        let bsz = x.dim(0)?;
        let seq_len = x.dim(1)?;
        let hidden_size = x.dim(2)?;
        let head_dim = hidden_size / self.num_heads;

        // Project the input to query, key, and value.
        let q = self.q_proj.forward(x)?.reshape((bsz, seq_len, self.num_heads, head_dim))?.transpose(1, 2)?;
        let k = self.k_proj.forward(x)?.reshape((bsz, seq_len, self.num_heads, head_dim))?.transpose(1, 2)?;
        let v = self.v_proj.forward(x)?.reshape((bsz, seq_len, self.num_heads, head_dim))?.transpose(1, 2)?;

        // Compute attention scores. The transpose now uses `isize`.
        let attn_scores = (q.matmul(&k.transpose(1, 2)?)? / (head_dim as f64).sqrt())?;
        
        // Softmax is now called as a function on the tensor.
        let attn_probs = candle_nn::ops::softmax(&attn_scores, 3)?;
        let attn_output = attn_probs.matmul(&v)?;

        // Reshape and project the output.
        let attn_output = attn_output.transpose(1, 2)?.reshape((bsz, seq_len, hidden_size))?;
        self.out_proj.forward(&attn_output)
    }
}

/// Implements the feed-forward network component of a decoder layer.
#[derive(Debug)]
pub struct FeedForward {
    fc1: candle_nn::Linear,
    fc2: candle_nn::Linear,
}

impl FeedForward {
    /// Loads the feed-forward layer's weights from a `VarBuilder`.
    pub fn load(vb: VarBuilder<'_>, cfg: &BioGptConfig) -> CandleResult<Self> {
        let fc1 = linear(cfg.hidden_size, cfg.intermediate_size, vb.pp("fc1"))?;
        let fc2 = linear(cfg.intermediate_size, cfg.hidden_size, vb.pp("fc2"))?;
        Ok(Self { fc1, fc2 })
    }

    /// Performs a forward pass through the feed-forward network.
    pub fn forward(&self, x: &Tensor) -> CandleResult<Tensor> {
        let x = self.fc1.forward(x)?.gelu()?;
        self.fc2.forward(&x)
    }
}

/// Represents a single decoder layer, combining self-attention and a feed-forward network.
#[derive(Debug)]
pub struct DecoderLayer {
    self_attn: Attention,
    feed_forward: FeedForward,
    norm1: candle_nn::LayerNorm,
    norm2: candle_nn::LayerNorm,
}

impl DecoderLayer {
    /// Loads the decoder layer's weights from a `VarBuilder`.
    pub fn load(vb: VarBuilder<'_>, cfg: &BioGptConfig) -> CandleResult<Self> {
        Ok(Self {
            self_attn: Attention::load(vb.pp("self_attn"), cfg)?,
            feed_forward: FeedForward::load(vb.pp("feed_forward"), cfg)?,
            norm1: layer_norm(cfg.hidden_size, cfg.layer_norm_eps, vb.pp("norm1"))?,
            norm2: layer_norm(cfg.hidden_size, cfg.layer_norm_eps, vb.pp("norm2"))?,
        })
    }

    /// Performs a forward pass through the decoder layer with residual connections.
    pub fn forward(&self, x: &Tensor) -> CandleResult<Tensor> {
        let norm1_out = self.norm1.forward(x)?;
        let attn_out = self.self_attn.forward(&norm1_out)?;
        let attn_out_with_residual = (&attn_out + x)?;
        
        let norm2_out = self.norm2.forward(&attn_out_with_residual)?;
        let ff_out = self.feed_forward.forward(&norm2_out)?;

        Ok((ff_out + &attn_out_with_residual)?)
    }
}

/// The main BioGPT model structure, composed of embeddings and a stack of decoder layers.
// #[derive(Debug)]
// pub struct DecoderLayer {
//     self_attn: Attention,
//     feed_forward: FeedForward,
//     norm1: candle_nn::LayerNorm,
//     norm2: candle_nn::LayerNorm,
// }
#[derive(Debug)]
pub struct BioGptModel {
    tok_embeddings: candle_nn::Embedding,
    pos_embeddings: candle_nn::Embedding,
    layers: Vec<DecoderLayer>,
    norm: candle_nn::LayerNorm,
    lm_head: candle_nn::Linear,
}

impl BioGptModel {
    /// Loads the full BioGPT model from a `VarBuilder` and a `BioGptConfig`.
    pub fn load(vb: VarBuilder<'_>, cfg: &BioGptConfig) -> CandleResult<Self> {
        let tok_embeddings = embedding(cfg.vocab_size, cfg.hidden_size, vb.pp("embeddings.word_embeddings"))?;
        let pos_embeddings = embedding(cfg.max_position_embeddings, cfg.hidden_size, vb.pp("embeddings.position_embeddings"))?;
        
        let mut layers = Vec::with_capacity(cfg.num_hidden_layers);
        for i in 0..cfg.num_hidden_layers {
            layers.push(DecoderLayer::load(vb.pp(&format!("decoder.layers.{i}")), cfg)?);
        }

        let norm = layer_norm(cfg.hidden_size, cfg.layer_norm_eps, vb.pp("layer_norm"))?;
        let lm_head = linear(cfg.hidden_size, cfg.vocab_size, vb.pp("lm_head"))?;

        Ok(Self {
            tok_embeddings,
            pos_embeddings,
            layers,
            norm,
            lm_head,
        })
    }
    
    /// Generates the token and position embeddings for the input.
    pub fn embed(&self, input_ids: &Tensor) -> CandleResult<Tensor> {
        let device = input_ids.device();
        let seq_len = input_ids.dim(1)?;
        let pos_ids = Tensor::arange(0u32, seq_len as u32, device)?
            .unsqueeze(0)?
            .expand(input_ids.dims())?;
        
        let tok = self.tok_embeddings.forward(input_ids)?;
        let pos = self.pos_embeddings.forward(&pos_ids)?;
        Ok((tok + pos)?)
    }
    
    /// Performs a forward pass of the model, from token IDs to output logits.
    pub fn forward(&self, input_ids: &Tensor) -> CandleResult<Tensor> {
        let input_embed = self.embed(input_ids)?;
        let mut h = input_embed.clone();
        for layer in self.layers.iter() {
            h = layer.forward(&h)?;
        }
        let h = self.norm.forward(&h)?;
        self.lm_head.forward(&h)
    }
}

// --- Canister State and Initialization ---

/// A struct to hold the initialized model and config.
#[derive(Debug)]
pub struct CanisterState {
    pub model: BioGptModel,
    pub config: BioGptConfig,
}

/// The canister initialization function.
/// This runs once when the canister is deployed and loads the model from stable memory.
// #[init]
fn init() {
    // Load config from stable memory.
    let config_bytes = storage::bytes(BIOGPT_CONFIG.to_string());
    let config: BioGptConfig = serde_json::from_slice(&config_bytes)
        .expect("Failed to deserialize BioGPT config");

    // Load model weights from stable memory.
    let model_bytes = storage::bytes(BIOGPT_RECCOMMENDATION.to_string());
    
    // Use `safetensors::load_buffer` for in-memory bytes.
    let tensors_map = safetensors::load_buffer(&model_bytes, &DEVICE)
        .expect("Failed to load model safetensors");

    // Create a `VarBuilder` directly from the safetensors map.
    // This is the correct way to handle in-memory tensors.
    let vb = VarBuilder::from_tensors(tensors_map, DType::F32, &DEVICE);

    // Load the BioGPT model.
    let model = BioGptModel::load(vb, &config)
        .expect("Failed to load BioGPT model");

    // Store the model and config in the global `OnceCell`.
    CANISTER_STATE.set(CanisterState { model, config })
        .expect("Failed to set canister state, it's already initialized");

    ic_cdk::println!("BioGPT model and config loaded successfully!");
}

// --- Generation Logic and Query Endpoint ---

// For demonstration, we use a simple character-based tokenizer and decoder.
// In a real-world scenario, you would use a pre-trained tokenizer.
fn simple_tokenizer(text: &str, vocab_size: usize) -> Vec<u32> {
    text.chars().map(|c| (c as u32) % (vocab_size as u32)).collect()
}

fn simple_decoder(ids: &[u32]) -> String {
    ids.iter().map(|&id| std::char::from_u32(id).unwrap_or(' ')).collect()
}

#[ic_cdk::query]
pub fn generate_response(prompt: String, max_new_tokens: usize) -> String {
    let canister_state = CANISTER_STATE.get().expect("Canister state not initialized");
    let model = &canister_state.model;
    let config = &canister_state.config;

    let mut tokens: Vec<u32> = simple_tokenizer(&prompt, config.vocab_size);
    let mut token_ids = Tensor::new(tokens.as_slice(), &DEVICE)
        .expect("Failed to create tensor")
        .unsqueeze(0)
        .expect("Failed to unsqueeze tensor");
    let mut generated_text = prompt.clone();

    for _ in 0..max_new_tokens {
        let logits = model.forward(&token_ids).expect("Forward pass failed");
        let seq_len = logits.dim(1).expect("Failed to get sequence length");
        let next_token_logits = logits
            .narrow(1, seq_len - 1, 1)
            .expect("Failed to narrow tensor")
            .squeeze(1)
            .expect("Failed to squeeze tensor");
        
        let next_token_id = next_token_logits
            .argmax(1)
            .expect("Failed to get argmax")
            .to_scalar::<u32>()
            .expect("Failed to convert to scalar");
        
        if next_token_id as usize == config.eos_token_id {
            break;
        }

        tokens.push(next_token_id);
        token_ids = Tensor::new(tokens.as_slice(), &DEVICE)
            .expect("Failed to create tensor")
            .unsqueeze(0)
            .expect("Failed to unsqueeze tensor");
        
        let new_char = simple_decoder(&[next_token_id]);
        generated_text.push_str(&new_char);
    }

    generated_text
}
