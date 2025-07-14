// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
// import { ChakraProvider } from '@chakra-ui/react'

// Import your main App component
import App from './App.jsx'; // Assuming App.jsx is in the same directory as main.jsx

// Import your global styling
import './index.scss';
// import theme from '../components/theme.jsx';

// The App component now encapsulates all the landing page logic,
// including image upload, camera, and prediction.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
