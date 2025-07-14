import React, { useState, useCallback } from 'react';

/**
 * ImageUploadArea Component
 * Handles drag-and-drop and file input for image selection.
 * @param {object} props - Component props.
 * @param {function(string): void} props.onImageSelect - Callback when an image is selected (returns base64 data URL).
 * @param {boolean} props.isDisabled - If true, the upload area is visually disabled.
 */
const ImageUploadArea = ({ onImageSelect, isDisabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file); // ✅ Pass file instead of base64
    }
  };

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file); // ✅ Pass file
    }
  }, [onImageSelect]);

  return (
    <div
      className={`upload-card ${isDragging ? 'dragging' : ''} ${isDisabled ? 'disabled' : ''}`}  // Fixed: Removed incorrect comment syntax
      onDragOver={isDisabled ? null : handleDragOver}
      onDragLeave={isDisabled ? null : handleDragLeave}
      onDrop={isDisabled ? null : handleDrop}
    >
      <label
        htmlFor="image-upload"
        className={`flex flex-col items-center justify-center h-64 text-center text-steelblue-200 hover:text-white transition duration-300
          ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <svg
          className="w-16 h-16 mb-4 text-steelblue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          ></path>
        </svg>
        <p className="text-lg font-semibold">Drag & Drop your image here</p>
        <p className="text-sm mt-1">or click to select a file</p>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isDisabled}
        />
      </label>
    </div>
  );
};

export default ImageUploadArea;
