# 🦠 **Malaria Federated Learning on ICP Blockchain**

---

### 📌 Overview

**Federated Learning (FL)** is a machine learning paradigm focused on **data privacy** and **distributed intelligence**.

- 🔒 Keeps data **local** on edge devices  
- 📡 Devices train **independently** and send **model updates**  
- 🔁 Central server aggregates updates using the **FedAvg algorithm**

   +------------+         +------------+         +------------+
   |  Device A  |         |  Device B  |         |  Device C  |
   +-----+------+         +-----+------+         +-----+------+
         |                      |                      |
  Local Training         Local Training         Local Training
         |                      |                      |
         v                      v                      v
   +-----------------------------------------------+
   |           FedAvg Aggregation Server           |
   |   (Aggregates & updates the global model)     |
   +--------------------+--------------------------+
                        |
                  Updated Model
                        |
                 ⬇ Broadcast Back
   +------------+   |   +------------+


---

### 🎯 Motivation

> Malaria remains a persistent health crisis, particularly in **remote African regions** where:

- ❌ Diagnostic labs are scarce  
- ❌ Trained personnel may be unavailable  
- ⚠️ Misdiagnoses are common—especially with low parasite loads or poor-quality blood smears  

---

#### 🔍 What drives this project?

- 🧪 Early-stage malaria is **hard to detect**  
- 🏥 Misdiagnosis leads to **avoidable fatalities**  
- 🤝 Personalized data from each region can help **tailor AI diagnostics**  
- 📱 Edge devices in local clinics can **learn collaboratively** while preserving privacy  

> ⚡️ We envision **AI-powered diagnostic tools** in every remote clinic—resilient, privacy-aware, and **locally adapted.**

---

### 🧠 Model Training

> Since no suitable pretrained model existed, we built one from scratch using **EfficientNetV2** and **TensorFlow**.

- 📊 **Dataset**:  
  - Source: [TFDS Malaria Dataset](https://www.tensorflow.org/datasets/catalog/malaria?hl=en)  
  - Classes: Infected vs. Uninfected blood cell images  

- 🔧 **Model Architecture**:  
  - Backbone: `EfficientNetV2`  
  - Framework: `TensorFlow`  
  - Accuracy: ✅ **94.5%** on test set  
  - Exported as: `.safetensors` (~5MB)  


🧩 *Why EfficientNetV2?*

- 📦 Compact size — suitable for low-resource devices  
- 🚀 Optimized for inference speed and accuracy  
- 🧪 Proven performance on complex datasets like CIFAR  

---

### 🚀 Deployment on ICP Blockchain

> The model is deployed to a **WebApp** powered by:

- ⚙️ **Rust** + **WASM** backend  
- 🌐 **React** + **TailwindCSS** frontend  
- 🔗 **ICP Blockchain** for secure and decentralized hosting  

#### 🌍 User Flow:


#### 📁 Source Files:
- 🧠 `agent.rs`: FedAvg aggregation logic  
- 🛠 `main.rs`: Model initialization & runtime  

---

### 🔄 Federated Learning Cycle

1. Clients perform local training  
2. Model weights sent to central server  
3. Server averages weights (FedAvg)  
4. Updated model sent back to clients  
5. Repeat  

---

### 🌍 Why Federated Learning?

✅ Enables learning from **diverse regions**  
✅ Avoids sharing **raw patient data**  
✅ Supports **personalized AI** tuned for different environments  
✅ Ideal for **low-resource** rural health centers  

---

### 🎯 Impact Goal

> By decentralizing learning and deploying AI on **edge devices**, we aim to:

- 💉 Improve diagnostic accuracy  
- 🌍 Reach underserved populations  
- 🔒 Preserve patient data privacy  
- 🤖 Build a smarter, collaborative malaria detection ecosystem  

---

### 📎 Future Enhancements

- 🩺 Add **explainable AI (XAI)** features  
- 📊 Monitor real-time model drift and retraining cycles  
- 🌐 Connect multiple clinics via blockchain nodes  

---

### 📫 Contributing / Questions?

If you'd like to contribute, suggest features, or ask questions — feel free to open an issue or reach out!

---
