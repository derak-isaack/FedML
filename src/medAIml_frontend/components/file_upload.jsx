import React, { useState, useEffect } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { medAIml_backend, idlFactory as backend_idlFactory } from '../../declarations/medAIml_backend';
// import { canisterId as backendCanisterId } from '../../declarations/medAIml_backend';

const backendCanisterId = 'bkyz2-fmaaa-aaaaa-qaaaq-cai';

const FileUploader = ({ onDataLoaded }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [actor, setActor] = useState(null);

  // ✅ Initialize actor (once)
  useEffect(() => {
    const initActor = async () => {
      try {
        const agent = new HttpAgent();
        if (process.env.DFX_NETWORK === 'local') {
          await agent.fetchRootKey();
        }

        const backend = Actor.createActor(backend_idlFactory, {
          agent,
          canisterId: backendCanisterId,
        });

        setActor(backend);
      } catch (error) {
        console.error('Actor init failed:', error);
        setUploadStatus('❌ Failed to initialize backend.');
      }
    };

    initActor();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 1. Preview image
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);

    // 2. Convert to Uint8Array
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // 3. Upload to backend heap
    try {
      if (actor && actor.upload_file) {
        await actor.upload_file([...uint8Array]); // Vec<u8>
        setUploadStatus('✅ Uploaded to backend.');
      } else {
        setUploadStatus('❌ Backend not ready.');
      }

      // 4. Inform parent component
      onDataLoaded && onDataLoaded(uint8Array);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadStatus('❌ Upload failed.');
    }
  };

  return (
    <div className="mb-4">
      <label className="text-gray-700 block mb-2 text-sm font-medium">
        Upload Image File
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0 file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          className="mt-4 max-h-48 rounded border border-gray-300 shadow"
        />
      )}
    </div>
  );
};

export default FileUploader;
