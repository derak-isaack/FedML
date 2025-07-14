### `Malaria Federated Learning(ICP Blockchain)`

*Federated learning* is the ML process where data privacy is of great concern. It involves uisng various edge devices to  collaboratively train and improve a model without necesarrily sharing their raw data. 
It uses the *FedAvg algorithm* which is the foundational algorithm in *Federated Learning*. It works by having clients performing local training on their data using `Stochastic Gradient Descent` and sending model updates to a central server. 

### `Motivation`

Malaria continues to be a significant challenge in many parts of Africa, particularly in remote areas where access to healthcare and medical laboratories and trained personell is limited. This often leads to delayed diagnosis or misdiagnoses. This is usually contributed to by poorly collected blood samples or when the parasite is still in its early stages making it harder to detect with conventional methods. 

Misdiagnosis not only delays treatment but also contributes to avoidable fatalities. Having withnessed how malaria diagnosis can vary from person to person- and region to region-I was motivated to explore a scientific decentralized, collaborative Machine learning solution that could strengthen diagnostic accuracy especially in areas with limited resources. 

By leveraging FL with edge devices, this project aims to create models that learn collaboratively from diverse data sources without compromisisng on patient data privacy. The visison is to empower frontline health workers and community clinics with AI assisted diagnostic tools thta are locally adapted, resilient and accessible. With collective effort and technology, we can move a step closer to eradcating the malaria burden in Africa. 

### `Model training`

Since there are no pretrained Malaria-centred ML models, we sought to build our own model using `Tensorflow (efficientNetV2)` which is a good model for resource constrained devicesas far as the malaria detection approach is concerned. This tensorflow model has achieved good performance on the leaderbors especially for difficult datasets like the `CIFAR dataset` which has more than 600 classes according to [this-paper](https://arxiv.org/html/2505.03303v1). 

This model was trained on the `Malaria dataset` which was collected from the [tensorhub](https://www.tensorflow.org/datasets/catalog/malaria?hl=en) and `EfficientNetV2` was used as the base model. The model achieved a `94.5%` accuracy on the test dataset. The trained model(5mbs) was exported to a safetensor formart because this is the easiest formart for deployment purposes. 
This small model size makes it ideal for deployment on edge devices which are restricted in terms of memory and computational power.

### `Model Deployment`

The model was deployed in a web application using `Rust` and `WebAssembly`(WASM) using `ICP Blockchain`. The web application was built using `React` and `TailwindCSS`. The application allows users to upload images of blood smears and get a prediction of whether the image contains malaria parasites or not. The application also allows users to view the model's performance metrics and the model's accuracy.

The `FedAvg` algorithm can be found in the `src/medAIml_backend` directory in the `agent.rs` file. This file averages the weights collected from edge devices and updates the model's weights by sending them to a central server. The `main.rs` file in the same directory is responsible for starting the agent and initializing the model. 

This approach ensures that model weights got from diverse data structures are averaged and updated in a collaborative manner and is particularly useful for distributed learning where data is collected from multiple sources and the model is trained on this data. This guarantees model improvement and accuracy as time goes by after being fed with enough data. 