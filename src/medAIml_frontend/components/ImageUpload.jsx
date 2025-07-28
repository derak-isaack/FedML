import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Actor, HttpAgent } from '@dfinity/agent';
// Import the idlFactory and canisterId from your generated declarations
import { idlFactory as backend_idl_factory, canisterId as backend_canister_id } from '../../declarations/medAIml_backend';

const agentHost = process.env.DFX_NETWORK === "local"
  ? `http://127.0.0.1:4943` // Default local replica address
  : `https://icp-api.io`;

const canisterID = 'bkyz2-fmaaa-aaaaa-qaaaq-cai';

const ImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rawImageBytes, setRawImageBytes] = useState(null);
  const [predictionResult, setPredictionResult] = useState('');
  // const [predictionResult, setPredictionResult] = useState('');
  const [predictionResultStage, setPredictionResultStage] = useState('');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const actorRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initActor = async () => {
      try {
        const agent = new HttpAgent({ host: agentHost });
        if (process.env.DFX_NETWORK === 'local') {
          await agent.fetchRootKey();
        }
        actorRef.current = Actor.createActor(backend_idl_factory, {
          agent,
          canisterId: backend_canister_id, // Use the imported canisterId
        });
        console.log('Actor initialized with backend canister.');
      } catch (error) {
        console.error('Failed to initialize actor:', error);
        setPredictionResult('Could not connect to backend.');
      }
    };
    initActor();
  }, []);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedImage(file);

    // Set preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    // Process raw bytes for backend
    const buffer = await file.arrayBuffer();
    setRawImageBytes(new Uint8Array(buffer));
    setPredictionResult('');
  };

  const handleCameraCapture = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedImage(file);

    // Set preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    // Process raw bytes for backend
    const buffer = await file.arrayBuffer();
    setRawImageBytes(new Uint8Array(buffer));
    setPredictionResult('');
  };

  const handleAnalyze = async () => {
    if (!rawImageBytes) {
      const messageBox = document.createElement('div');
      messageBox.className = 'custom-message-box info';
      messageBox.innerHTML = "Please upload an image or take a photo first.";
      document.body.appendChild(messageBox);
      setTimeout(() => {
        if (document.body.contains(messageBox)) {
          document.body.removeChild(messageBox);
        }
      }, 3000);
      return;
    }

    if (!actorRef.current) {
      setPredictionResult('Backend not initialized.');
      return;
    }

    setIsAnalyzing(true);
    setPredictionResult('Predicting...');

    try {
      const prediction = await actorRef.current.load_and_predict(rawImageBytes);

      if ('Ok' in prediction) {
        const [classIndex, label, score] = prediction.Ok;
        const confidence = (score * 100).toFixed(2);

        setPredictionResult(`Class: ${classIndex} — ${label} — Score: ${confidence}%`);

        let stageLabel = "No malaria stage (uninfected)";
        let stageConfidence = 0.0;

        if (score > 0.5) {
          const stagePrediction = await actorRef.current.load_and_predict_malaria_stage(rawImageBytes);

          if ('Ok' in stagePrediction) {
            const { 0: stageLabel, 1: rawStageConfidence } = stagePrediction.Ok;
            const stageConfidence = (rawStageConfidence * 100).toFixed(2);
            setPredictionResultStage(`Stage: ${stageLabel} — Confidence: ${stageConfidence}%`);
          } else if ('Err' in stagePrediction) {
            console.error('Stage prediction failed:', stagePrediction.Err);
            setPredictionResultStage(`Stage prediction failed: ${stagePrediction.Err}`);
          } else {
            console.error('Unexpected stage prediction format:', stagePrediction);
            setPredictionResultStage("Stage prediction failed.");
          }}


        const newPrediction = {
          id: Date.now(),
          imageId: `IMG_${Date.now().toString().slice(-3)}`,
          result: label,
          stage: stageLabel,
          confidence: parseFloat(confidence),
          timestamp: new Date(),
          reward: (Math.random() * 0.05 + 0.03).toFixed(3), 
          status: 'pending_payout',
          imageName: selectedImage.name || 'Captured Image'
        };

        const existingPredictions = JSON.parse(localStorage.getItem('malcare_predictions') || '[]');
        existingPredictions.unshift(newPrediction);
        localStorage.setItem('malcare_predictions', JSON.stringify(existingPredictions));

        setTimeout(() => {
          navigate('/dashboard');
        }, 7000);

      } else if ('err' in prediction) {
        setPredictionResult(`Prediction error: ${String(prediction.err)}`);
        console.log('Prediction error:', prediction.err);
      } else {
        setPredictionResult(`Prediction result: ${JSON.stringify(prediction)}`);
        console.log('Unexpected structure:', prediction);
      }
    } catch (err) {
      console.error('Prediction exception:', err);
      setPredictionResult(`Prediction failed: ${err.message || err}`);
    } finally {
      setIsAnalyzing(false);
  }}


  const handleClear = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
  <div className="image-upload-container">
    <h1 className="upload-title">Upload Image for Malaria Detection</h1>

    <div className="upload-cards">
      <div
        className="upload-card"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-icon">📁</div>
        <h3 className="upload-title">Choose from Files</h3>
        <p className="upload-description">
          Select an image from your device to analyze for malaria detection
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />
      </div>

      <div
        className="upload-card"
        onClick={() => cameraInputRef.current?.click()}
      >
        <div className="upload-icon">📷</div>
        <h3 className="upload-title">Take Photo</h3>
        <p className="upload-description">
          Use your device camera to capture an image for analysis
        </p>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={handleCameraCapture}
        />
      </div>
    </div>

    {imagePreview && (
      <div className="preview-section">
        <h2 className="preview-title">Image Preview</h2>
        <div className="image-preview">
          <img src={imagePreview} alt="Selected for analysis" />
          <div className="preview-actions">
            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing... 🔄' : 'Analyze for Malaria'}
            </button>
            <button className="clear-btn" onClick={handleClear}>
              Clear Image
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Prediction Result */}
    {predictionResult && (
      <div className="result-card">
        <h3 className="result-title">Prediction Result</h3>
        <p className="result-text">{predictionResult}</p>
      </div>
    )}

    {/* Malaria Stage Result */}
    {predictionResultStage && (
      <div className="result-card">
        <h3 className="result-title">Malaria Stage</h3>
        <p className="result-text">{predictionResultStage}</p>
      </div>
    )}
  </div>
)};


export default ImageUpload;