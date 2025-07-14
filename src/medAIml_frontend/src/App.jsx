import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
// Import the idlFactory and canisterId from your generated declarations
// Assuming your backend canister is named 'medAIml_backend'
import { idlFactory as backend_idlFactory, canisterId } from '../../declarations/medAIml_backend';
import LandingPage from '../components/LandingPage';
import ImageUploadArea from '../components/ImageUpload';
import CameraView from '../components/Camera';
import './index.scss';


const agentHost = process.env.DFX_NETWORK === "local"
  ? `http://127.0.0.1:4943` // Default local replica address
  : `https://icp-api.io`;


const canisterID = 'bkyz2-fmaaa-aaaaa-qaaaq-cai'; 

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);       
  const [rawImageBytes, setRawImageBytes] = useState(null);       
  const [predictionResult, setPredictionResult] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const actorRef = useRef(null);

  // Initialize backend actor
  useEffect(() => {
    const initActor = async () => {
      try {
        const agent = new HttpAgent({ host: agentHost }); // Use agentHost for both local and IC
        if (process.env.DFX_NETWORK === 'local') {
          await agent.fetchRootKey();
        }

        actorRef.current = Actor.createActor(backend_idlFactory, {
          agent,
          canisterId: canisterID, // Use the canisterId imported from declarations
        });

        console.log('Actor initialized with backend canister.');
      } catch (error) {
        console.error('Failed to initialize actor:', error);
        setPredictionResult('Could not connect to backend.');
      }
    };

    initActor();
  }, []); // Empty dependency array ensures this runs once on mount

  const preprocessImageToUint8 = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 224, 224);

      const imageData = ctx.getImageData(0, 0, 224, 224).data;
      const floatArray = new Float32Array(1 * 224 * 224 * 3); // NHWC

      for (let y = 0; y < 224; y++) {
        for (let x = 0; x < 224; x++) {
          const i = y * 224 + x;
          const base = i * 4;
          floatArray[i * 3 + 0] = imageData[base + 0] / 255.0; // R
          floatArray[i * 3 + 1] = imageData[base + 1] / 255.0; // G
          floatArray[i * 3 + 2] = imageData[base + 2] / 255.0; // B
        }
      }

      const uint8Array = new Uint8Array(floatArray.buffer);
      resolve(uint8Array);
    };

    img.onerror = (e) => reject("❌ Failed to load image");
  });
};
  // const handleCameraCapture = async (dataUrl) => {
  //   const uint8Array = await preprocessImageToUint8(dataUrl);
  //   setRawImageBytes(uint8Array);
  //   setPredictionResult('');
  //   setIsCameraOn(false);
  // };

  const handleImageSelected = async (file) => {
    if (!file) return;

    const buffer = await file.arrayBuffer();
    setRawImageBytes(new Uint8Array(buffer));
    setPredictionResult('');
    setIsCameraOn(false);
  };

  const handlePredict = async () => {
    if (!rawImageBytes) {
      setPredictionResult('Please select or capture an image.');
      return;
    }

    if (!actorRef.current) {
      setPredictionResult('Backend not initialized.');
      return;
    }

    setIsLoading(true);
    setPredictionResult('Predicting...');

    try {
      const prediction = await actorRef.current.load_and_predict(rawImageBytes);
      if ('ok' in prediction) {
        const [classIndex, label] = prediction.ok;
        setPredictionResult(`Class: ${classIndex} — ${label}`);
      } else if ('err' in prediction) {
        setPredictionResult(`Prediction error: ${String(prediction.err)}`);
        console.log('Prediction error:', prediction.err);
      } else {
        setPredictionResult(`Unexpected prediction result: ${JSON.stringify(prediction)}`);
        console.log('Unexpected structure:', prediction);
      }
    } catch (err) {
      console.error('Prediction exception:', err);
      setPredictionResult(`Prediction failed: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="relative min-h-screen overflow-hidden bg-space text-white flex flex-col items-center">

    {/* Starfield Background */}
    <div className="bg-stars absolute inset-0 z-0"></div>

    {/* Navbar */}
    <nav className="relative z-10 flex justify-between items-center p-4 glass-card shadow-lg rounded-b-lg w-full max-w-4xl">
      <span className="text-2xl font-bold text-steelblue-300">DeepAI</span>
      <div className="flex space-x-6">
        <a href="#" className="nav-link">Signup</a>
        <a href="#" className="nav-link">Login</a>
      </div>
    </nav>

    {/* Main Content */}
    <main className="relative flex flex-col items-center justify-center p-6 w-full text-center flex-grow">

      <div className="mx-auto max-w-xl">
        <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">
          Contribute to <span className="text-steelblue-300">Malaria research</span> to make the world a better place
        </h1>
        <p className="text-lg mb-6">
          Federated Learning maintains <strong>data privacy</strong>, so your data <strong>is always on local</strong> and respects patient data privacy concerns.
        </p>
      </div>

      <button className="bg-gradient-button hover:scale-105 transition-all text-white font-bold py-3 px-8 rounded-full shadow-2xl mb-6">
        Improve my AI 🛠️
      </button>

      <div className="text-steelblue-300 mb-8">★★★★★ 1000+ happy devs</div>

      {/* Curved Glow */}
      <div className="curved-glow"></div>

      {/* Curved Background */}
      <div className="curved-bottom-bg"></div>
      {/* <div className="relative w-full max-w-2xl flex flex-col items-center">
      <div className="bg-upload-card ..."></div> */}

      {/* Upload Card */}
      <div className="relative w-full max-w-2xl flex flex-col items-center z-10">
        <div className="bg-upload-card relative p-8 rounded-xl shadow-2xl backdrop-blur-md w-full text-center">
          {isCameraOn ? (
            <CameraView
              isCameraOn={isCameraOn}
              onPhotoCapture={handlePhotoCaptured}
              onCameraError={handleCameraError}
            />
          ) : (
            <ImageUploadArea onImageSelect={handleImageSelected} isDisabled={isCameraOn} />
          )}

          <div className="flex space-x-4 mt-4 justify-center">
            {!isCameraOn ? (
              <button onClick={() => setIsCameraOn(true)} className="glass-button bg-action-blue hover:bg-action-blue-dark text-white font-bold py-2 px-6 rounded-full shadow-lg hover:scale-105">
                Turn On Camera
              </button>
            ) : (
              <button onClick={() => setIsCameraOn(false)} className="glass-button bg-neutral-gray hover:bg-neutral-gray-dark text-white font-bold py-2 px-6 rounded-full shadow-lg hover:scale-105">
                Turn Off Camera
              </button>
            )}
            <button onClick={handlePredict} disabled={isLoading} className={`glass-button bg-predict-blue hover:bg-predict-blue-dark text-white font-bold py-2 px-6 rounded-full shadow-lg hover:scale-105 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isLoading ? 'Predicting...' : 'Predict'}
            </button>
          </div>

          {predictionResult && (
            <div className="glass-card mt-4 p-4 rounded-lg shadow-xl text-center">
              <p className="text-lg text-steelblue-200">{predictionResult}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  </div>
)};


export default App;
