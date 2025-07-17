use candid::CandidType;
use ic_cdk::api;
use csv_core::{Reader, ReadFieldResult, ReadRecordResult};
use std::collections::HashMap;
use std::{borrow::Cow, cell::RefCell};
use std::fs::File;
use std::io::BufReader;
use std::ops::{Sub, Div};
use candid::types::Serializer;
use anyhow::{Context, Result};
use candle_core::{DType, Device, Tensor, Module, Result as CandleResult};
use candle_nn::{optim, Conv2d, linear, Optimizer, loss, VarMap, VarBuilder, Activation};
use candle_nn::Sequential;
// use candle_nn::Linear;
use candle_nn::linear::Linear;
 use candle_nn::seq;
use ic_cdk_macros::{self, query, update};
use serde::{Serialize, Deserialize};
use serde_json::{self, Value};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap, StableCell, Storable,
};
use candle_transformers::models::resnet::resnet50;
use ic_stable_structures::storable::Blob;
use std::path::Path;
use candle_core::safetensors;
use crate::storage;
use candle_nn::ops::{sigmoid, softmax};
use candle_nn::ops::leaky_relu;
// use image::GenericImageView;

const DEVICE: Device = Device::Cpu;

const FEATURE_DIMENSION: usize = 7;
const NUM_CLASSES: usize = 2;
const LABELS: usize = 2;

//Define a heap memory to store the model weights and uploaded file. 
const WASI_MEMORY_ID: MemoryId = MemoryId::new(10);

// Files in the WASI filesystem (in the stable memory) that store the models.
const MALARIA_MODEL: &str = "malaria_mobilenetSmall.safetensors";
const MODEL_CONFIG: &str = "config.json";

type Memory1 = VirtualMemory<DefaultMemoryImpl>;
thread_local! {
    pub static MODEL_WEIGHTS: RefCell<Vec<u8>> = RefCell::new(Vec::new());
    pub static MODEL_CONFIG_V3: RefCell<Vec<u8>> = RefCell::new(Vec::new());

    pub static MALARIA_MODEL_V3: RefCell<Vec<u8>> = RefCell::new(Vec::new());
    pub static MODEL_CONFIG_V3_V2: RefCell<Vec<u8>> = RefCell::new(Vec::new());

    //store the model weights for easy model loading
    pub static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    
    pub static FILE_STORAGE: RefCell<Vec<u8>> = RefCell::default();
}

#[ic_cdk::update]
fn append_openai_model_bytes(bytes: Vec<u8>) {
    storage::append_bytes(MALARIA_MODEL.to_string(), bytes);
}

#[ic_cdk::update]
fn append_model_config_bytes(bytes: Vec<u8>) {
    storage::append_bytes(MODEL_CONFIG.to_string(), bytes);
}

#[derive(Serialize, Deserialize, Clone, CandidType)]
pub struct Model {
    model: Vec<u8>,

}


#[derive(Serialize, Deserialize, Clone, CandidType)]
pub struct ModelWeights{
    pub model_weights: Vec<String>,
    pub num_samples: usize,
    pub loss: f64,
    pub model_version: usize,
}

//Define the defaulttraining configurations for the model.
#[derive(Debug, Clone)]
pub struct TrainingConfig {
    pub num_epochs: usize,
    pub batch_size: usize,
    pub num_workers: usize,
    pub seed: u64,
}

impl Default for TrainingConfig {
    fn default() -> Self {
        TrainingConfig {
            num_epochs: 10,      
            batch_size: 64,      
            num_workers: 4,      
            seed: 42,            
        }
    }
}


#[derive(Debug, serde::Deserialize, CandidType)]
pub struct Dataset {
    image: Vec<u8>,
}



//Function to upload the image file to the Heap memory.
#[ic_cdk::update]
pub fn upload_file(data: Vec<u8>) -> Vec<u8> {
    FILE_STORAGE.with(|storage| {
        let mut file_storage = storage.borrow_mut();
        file_storage.clear(); 
        file_storage.extend_from_slice(&data); 
        data.clone() 
    })
}


#[ic_cdk::update]
pub fn read_image_data(image_data: Vec<u8>) -> Result<Dataset, DatasetError> {
    //image crate to decode the image
    let img = image::load_from_memory(&image_data)
        .map_err(|e| DatasetError { message: e.to_string() })?;

    Ok(Dataset {
        image: image_data,
    })
}

//Convert Dataset to Tensors for training
#[derive(CandidType, Deserialize)]
pub enum DatasetResult {
    Ok(Dataset),
    Err(DatasetError),
}


#[derive(candid::CandidType, serde::Deserialize)]
pub struct DatasetError {
    message: String,
}

// Function to convert Dataset to Tensors for model training
#[ic_cdk::update]
pub fn dataset_to_tensors(dataset: Dataset) -> Result<Vec<Vec<f32>>, DatasetError> {
    let img = image::load_from_memory(&dataset.image)
        .map_err(|e| DatasetError { message: format!("Image decode error: {}", e) })?
        .resize_exact(224, 224, image::imageops::FilterType::Triangle)
        .to_rgb8();

    let (width, height) = img.dimensions(); // Should be 224 x 224

    let mut tensor = Vec::new();
    for c in 0..3 {
        for y in 0..height {
            for x in 0..width {
                let pixel = img.get_pixel(x, y);
                tensor.push(pixel[c] as f32 / 255.0); // Normalize
            }
        }
    }

    Ok(vec![tensor]) // shape: [1, 150528]
}



//Define the layers for the model architecture and instantiate new model.
#[derive(Debug, Clone, CandidType, Deserialize)] 
pub struct ModelConfig {
    model_type: String,
    input_shape: Vec<usize>,
    num_classes: usize,
    activation: String,
    pooling: String,
    hidden_units: Vec<usize>,
    framework: String,
    pretrained_base: String,
    trainable_base: bool,
    classifier_head: ClassifierHead,
}

#[derive(Debug, Clone, CandidType, Deserialize)]
struct ClassifierHead {
    dense_1: DenseLayer,
    output: DenseLayer,
}

#[derive(Debug, Clone, CandidType, Deserialize)]
struct DenseLayer {
    units: usize,
    activation: String,
}

pub struct MalariaModelV3 {
    pub model: Sequential,
    pub config: ModelConfig,
}



impl MalariaModelV3 {
    pub fn new(config: ModelConfig, vb: VarBuilder) -> Result<Self> {
        // Helper to get activation function closures with uniform signature
        fn get_activation_fn(name: &str) -> Box<dyn Fn(&Tensor) -> CandleResult<Tensor> + Send + Sync> {
            match name {
                "relu" => Box::new(|x: &Tensor| x.relu()),
                "leaky_relu" => Box::new(move |x: &Tensor| leaky_relu(x, 0.01)),
                "sigmoid" => Box::new(|x: &Tensor| sigmoid(x)),
                "softmax" => Box::new(|x: &Tensor| softmax(x, 1)),
                _ => Box::new(|x: &Tensor| x.relu()),
            }
        }

        let mut seq = seq();

        let initial_in_features = config.input_shape[1] * config.input_shape[2] * config.input_shape[3];

        for (i, &units) in config.hidden_units.iter().enumerate() {
            let in_features = if i == 0 {
                // config.input_shape[1]
                initial_in_features
            } else {
                config.hidden_units[i - 1]
            };
            ic_cdk::println!("Linear layer {}: in_features={}, out_features={}", i, in_features, units);

            // Use candle_nn::linear (function, not method) with ? to handle Result
            let linear_layer = candle_nn::linear(in_features, units, vb.pp(format!("hidden_{}", i)))?;
            seq = seq.add(linear_layer);

            let activation_fn = get_activation_fn(&config.activation);
            seq = seq.add_fn(activation_fn);
        }

        // Classifier head dense_1 layer
        let dense_1_in_features = *config.hidden_units.last().unwrap_or(&initial_in_features);
        ic_cdk::println!("Classifier dense_1: in_features={}, out_features={}", dense_1_in_features, config.classifier_head.dense_1.units);
        let dense_1 = candle_nn::linear(
            *config.hidden_units.last().unwrap_or(&64),
            config.classifier_head.dense_1.units,
            vb.pp("classifier.dense_1"),
        )?;
        seq = seq.add(dense_1);

        let classifier_activation_fn = get_activation_fn(&config.classifier_head.dense_1.activation);
        seq = seq.add_fn(classifier_activation_fn);

        // Final output layer
        ic_cdk::println!("Classifier output: in_features={}, out_features={}", config.classifier_head.dense_1.units, config.num_classes);
        let output_layer = candle_nn::linear(
            config.classifier_head.dense_1.units,
            config.num_classes,
            vb.pp("classifier.output"),
        )?;
        seq = seq.add(output_layer);

        Ok(Self { model: seq, config })
    }

    pub fn forward(&self, xs: &Tensor) -> Result<Tensor> {
        Ok(self.model.forward(xs)?)
    }
}


#[ic_cdk::init]
fn init() {
    let wasi_memory = MEMORY_MANAGER.with(|m| m.borrow().get(WASI_MEMORY_ID));
    ic_wasi_polyfill::init_with_memory(&[0u8; 32], &[], wasi_memory);
}

fn load_model_bytes_from_storage() -> Vec<u8> {
    crate::storage::bytes("malaria_mobilenetSmall.safetensors".to_string()) 
}

fn load_config_from_storage() -> Vec<u8> {
    crate::storage::bytes("config.json".to_string()) 
}

#[ic_cdk::update]
pub fn load_and_predict(image_bytes: Vec<u8>) -> Result<(u32, String, f32), String> {
    let device = Device::Cpu;
    let mut varmap = VarMap::new();
    let vb = VarBuilder::from_varmap(&mut varmap, DType::F32, &device);

    //Load model weights
    let model_weights = load_model_bytes_from_storage();
    if model_weights.is_empty() {
        return Err("Model weights not found in stable storage.".to_string());
    }

    let safetensors = candle_core::safetensors::load_buffer(&model_weights, &device)
        .map_err(|e| format!("Failed to load weights: {:?}", e))?;

    for (name, _tensor) in safetensors.iter() {
        ic_cdk::println!("Available tensor key: {}", name);
    }

    //Load model config
    let config_bytes = load_config_from_storage();
    if config_bytes.is_empty() {
        return Err("Model config not found in stable storage.".to_string());
    }

    let config: ModelConfig = serde_json::from_slice(&config_bytes)
        .map_err(|e| format!("Failed to deserialize model config: {:?}", e))?;

    //Image preprocessing
    let img = image::load_from_memory(&image_bytes)
        .map_err(|e| format!("Image decode error: {}", e))?
        .resize_exact(224, 224, image::imageops::FilterType::Triangle)
        .to_rgb8();

    let (width, height) = img.dimensions();
    let image_data: Vec<f32> = img
        .pixels()
        .flat_map(|p| p.0)
        .map(|v| v as f32 / 255.0)
        .collect();

    let tensor = Tensor::from_vec(image_data, &[1, 224 * 224 * 3], &device)
        .map_err(|e| format!("Tensor creation error: {:?}", e))?;

    let model = MalariaModelV3::new(config, vb)
        .map_err(|e| format!("Model creation error: {:?}", e))?;

    let pred = model
        .forward(&tensor)
        .map_err(|e| format!("Prediction error: {:?}", e))?;

    let probabilities = sigmoid(&pred)
        .map_err(|e| format!("Sigmoid error: {:?}", e))?;

    let probs_vec = probabilities
        .to_vec2::<f32>()
        .map_err(|e| format!("Probability tensor to vec error: {:?}", e))?;

    // Extract probability
    let class_prob = probs_vec
        .get(0)
        .and_then(|v| v.get(0))
        .copied()
        .ok_or_else(|| "Failed to extract class probability.".to_string())?;


    // Apply threshold to get class index
    let class_idx = if class_prob >= 0.5 { 1 } else { 0 };

    let labels = vec!["Healthy", "Malaria detected"];
    let label = labels
        .get(class_idx as usize)
        .unwrap_or(&"Unknown")
        .to_string();

    Ok((class_idx, label, class_prob))

}



#[derive(Serialize, Deserialize)]
struct SerializedWeights {
    ln1_weight: Vec<f32>,
}



//Get the model weights to perform the federated learning. 
pub fn get_model_weights() -> candle_core::Result<Vec<u8>> {
    MODEL_WEIGHTS.with(|weights| {
        Ok(weights.borrow().clone())
        }
    )
}
