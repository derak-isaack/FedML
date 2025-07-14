import React, { useRef, useEffect, useCallback } from 'react';

/**
 * CameraView Component
 * Manages camera stream, display, and photo capture.
 * @param {object} props - Component props.
 * @param {boolean} props.isCameraOn - Controls whether the camera is active.
 * @param {function(string): void} props.onPhotoCapture - Callback when a photo is taken (returns base64 data URL).
 * @param {function(): void} props.onCameraError - Callback for camera access errors.
 */
const CameraView = ({ isCameraOn, onPhotoCapture, onCameraError }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null); // To store the MediaStream object

  // Effect to manage camera stream lifecycle
  useEffect(() => {
    const startStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        onCameraError("Failed to access camera. Please ensure permissions are granted.");
      }
    };

    if (isCameraOn) {
      startStream();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOn, onCameraError]);

  const takePhoto = useCallback(() => {
    if (videoRef.current && isCameraOn) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/png');
      onPhotoCapture(imageDataUrl);
    }
  }, [isCameraOn, onPhotoCapture]);

  return (
    <div className="flex flex-col items-center justify-center h-64 w-full max-w-2xl bg-purple-800 p-8 rounded-xl shadow-2xl mb-8">
      <video ref={videoRef} className="w-full h-full object-contain rounded-lg shadow-md" autoPlay playsInline></video>
      <button
        onClick={takePhoto}
        className="mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-75"
      >
        Take Photo
      </button>
    </div>
  );
};

export default CameraView;
