mod client; 
mod agent;
mod server; 
use serde::Deserialize;
use candle_core::{DType, Device, Tensor};
use candle_nn::{linear, Linear, Module, Optimizer, VarBuilder, VarMap};
use crate::client::{FILE_STORAGE, upload_file, read_image_data, Dataset, DatasetError, dataset_to_tensors, load_and_predict,
                    MODEL_WEIGHTS, ModelConfig};
use candid::CandidType;
mod storage;

const DEVICE: Device = Device::Cpu;
use getrandom::Error;

#[no_mangle]
unsafe extern "Rust" fn __getrandom_v03_custom(
    dest: *mut u8,
    len: usize,
) -> Result<(), Error> {
    for i in 0..len {
        *dest.add(i) = 0; // Fill with zeros
    }
    Ok(())
}


fn main()->anyhow::Result<()>{
  
  Ok(())
}

ic_cdk::export_candid!();