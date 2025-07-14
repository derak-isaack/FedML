use crate::client::{MODEL_WEIGHTS, get_model_weights, Model};
use candle_core::{Tensor, Result, DType, Device};
use std::error::Error;
use postcard;
use serde::{Serialize, Deserialize};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap, StableCell, Storable,
};
use std::cell::RefCell;

const DEVICE: Device = Device::Cpu;

#[derive(Serialize, Deserialize, Clone)]
struct WeightsSerialized {
    ln1_weight: Vec<f32>,
}

//Define a heap memory to store the aggregated model weights which are then to be sent to the server. 
thread_local! {
    pub static AGGREGATED_MODEL: RefCell<Option<(WeightsSerialized, usize)>> = RefCell::new(None);
}

/// Aggregates a list of serialized model weights using federated averaging.
pub fn update_aggregated_model(new_serialized: Vec<u8>, new_samples: usize) -> candle_core::Result<()> {
    // Deserialize the new client model.
    let new_model: WeightsSerialized = postcard::from_bytes(&new_serialized)
        .map_err(|e| candle_core::Error::msg(format!("Deserialization error: {:?}", e)))?;
        
    AGGREGATED_MODEL.with(|cell| {
        let mut agg = cell.borrow_mut();
        if let Some((current_model, current_samples)) = agg.take() {
            // Ensure both models have the same weight vector length.
            if current_model.ln1_weight.len() != new_model.ln1_weight.len() {
                return Err(candle_core::Error::msg("Mismatched weight lengths"));
            }
            let total_samples = current_samples + new_samples;
            // Perform a weighted average update.
            let updated_weights = current_model.ln1_weight.iter()
                .zip(new_model.ln1_weight.iter())
                .map(|(cw, nw)| {
                    (cw * current_samples as f32 + nw * new_samples as f32) / total_samples as f32
                })
                .collect::<Vec<f32>>();
            *agg = Some((WeightsSerialized { ln1_weight: updated_weights }, total_samples));
        } else {
            // If no aggregated model exists, initialize it with the new model.
            *agg = Some((new_model, new_samples));
        }
        Ok(())
    })
}


//Retrieve current aggregated model weights. 
pub fn get_aggregated_model() -> Option<WeightsSerialized> {
    AGGREGATED_MODEL.with(|cell| {
        cell.borrow().as_ref().map(|(model, _)| model.clone())
    })
}
