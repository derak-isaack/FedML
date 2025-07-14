// use crate::agent::fed_avg_encrypted;
// use ic_oss_can::types::{Chunk, FileId};
// use ic_oss_types::file::*;
// use ic_stable_structures::{
//     memory_manager::{MemoryId, MemoryManager, VirtualMemory},
//     DefaultMemoryImpl, StableBTreeMap, StableCell, Storable,
// };
// use std::borrow::Cow;
// use std::cell::RefCell;
// use candid::Deserialize;
// use candid::CandidType;
// use serde::Serialize;
// use serde_bytes::ByteBuf;


// type Memory = VirtualMemory<DefaultMemoryImpl>;

// const STATE_MEMORY_ID: MemoryId = MemoryId::new(0);
// const FS_DATA_MEMORY_ID: MemoryId = MemoryId::new(1);

// thread_local! {
//     static AI_MODEL: RefCell<Option<AIModel>> = const { RefCell::new(None) };

//     static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
//         RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

//     static STATE_STORE: RefCell<StableCell<State, Memory>> = RefCell::new(
//         StableCell::init(
//             MEMORY_MANAGER.with_borrow(|m| m.get(STATE_MEMORY_ID)),
//             State::default()
//         ).expect("failed to init STATE_STORE store"))

//     static FS_CHUNKS_STORE: RefCell<StableBTreeMap<FileId, Chunk, Memory>> = RefCell::new(
//         StableBTreeMap::init(
//             MEMORY_MANAGER.with_borrow(|m| m.get(FS_DATA_MEMORY_ID))
//         )
//     );,
// }

// ic_oss_can::ic_oss_fs!();

// #[derive(CandidType, Debug, Serialize, Deserialize)]
// pub struct WeightsUpdate {
//     pub model_weights: Vec<String>,
//     pub num_samples: usize,
//     pub loss: f64,
//     pub model_version: usize,
// }

// impl Storable for WeightsUpdate {
//     fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
//         Cow::Owned(serde_json::to_vec(self).unwrap())
//     }
//     fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
//         serde_json::from_slice(&bytes).unwrap()
//     }
// }

// pub fn load_weights(args: &WeightsUpdate) -> WeightsUpdate {
//     AI_MODEL.with(|r| {
//         let r.borrow_mut() = Some(AIModel {
//             model_weights: fs::get_full_chunks(args.model_weights)?,
//             num_samples: fs::get_full_chunks(args.num_samples)?,
//             loss: fs::get_full_chunks(args.loss),
//             model_version: fs::get_full_chunks(args.model_version),
//         });
//         Ok(())
//     })
// }

// //Only load the weights when the user is authenticated. 
// fn is_controller_or_manager() -> Result<(), String> {
//     let caller = ic_cdk::caller();
//     if ic_cdk::api::is_controller(&caller) || fs::is_manager(&caller) {
//         Ok(())
//     } else {
//         Err("user is not a controller or manager".to_string())
//     }
// }

// #[ic_cdk::update(guard = "is_controller_or_manager")]
// fn admin_load_weights(args: WeightsUpdate) -> Result<u64, String> {
//     state::load_weights(&args)?;
//     state::with_mut(|s| {
//         s.model_weights = args.model_weights;
//         s.num_samples = args.num_samples;
//         s.loss = args.loss;
//         s.model_version = args.model_version; 
//     });

//     Ok(ic_cdk::api::performance_counter(1))
// }

// #[ic_cdk::post_upgrade]
// fn post_upgrade() {
//     state::load();
//     fs::load();
//     state::with(|s| {
//         if s.ai_model > 0 {
//             let _ = state::load_model(&WeightsUpdate {
//                 config_id: s.ai_config,
//                 tokenizer_id: s.ai_tokenizer,
//                 model_id: s.ai_model,
//             })
//             .map_err(|err| ic_cdk::trap(&format!("failed to load model: {:?}", err)));
//         }
//     });
// }

// ic_cdk::export_candid!();