import React, { useState, useEffect } from 'react';
import { useIdentity } from './InternetIdentityProvider';
import googleAuthService from '../services/googleAuth';

const AuthModal = ({ onClose }) => {
  const { login: icLogin } = useIdentity();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    // Initialize Google Auth when modal opens
    const initializeGoogleAuth = async () => {
      try {
        await googleAuthService.initialize();
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
      }
    };

    initializeGoogleAuth();
  }, []);

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      console.log('Initiating real Google OAuth...');
      
      // Use real Google OAuth
      const googleUser = await googleAuthService.signIn();
      
      // Store user data in localStorage
      localStorage.setItem('malcare_google_user', JSON.stringify(googleUser));
      
      console.log('Google authentication successful:', googleUser);
      
      // Trigger a page refresh to update the header
      window.location.reload();
      
      onClose();
    } catch (error) {
      console.error('Google authentication failed:', error);
      alert('Google authentication failed. Please try again or check if popups are blocked.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleICPAuth = async () => {
    setIsLoggingIn(true);
    try {
      await icLogin();
      console.log('Internet Identity login successful');
      onClose();
    } catch (error) {
      console.error('ICP authentication failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="auth-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2 className="modal-title">Welcome to MalCare</h2>
        <p className="modal-subtitle">Choose your preferred sign-in method</p>
        
        <div className="auth-buttons">
          <button 
            className="auth-btn google"
            onClick={handleGoogleAuth}
            disabled={isGoogleLoading}
          >
            <span>🔍</span>
            {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
          </button>
          
          <button 
            className="auth-btn icp"
            onClick={handleICPAuth}
            disabled={isLoggingIn}
          >
            <span>🌐</span>
            {isLoggingIn ? 'Connecting...' : 'Continue with Internet Identity'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;