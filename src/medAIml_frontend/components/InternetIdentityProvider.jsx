import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

const IdentityContext = createContext();

export const useIdentity = () => {
  const context = useContext(IdentityContext);
  if (!context) {
    throw new Error('useIdentity must be used within an InternetIdentityProvider');
  }
  return context;
};

const InternetIdentityProvider = ({ children }) => {
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const client = await AuthClient.create();
        setAuthClient(client);
        
        const isAuth = await client.isAuthenticated();
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          const identity = client.getIdentity();
          const principal = identity.getPrincipal();
          setIdentity(identity);
          setPrincipal(principal);
        }
      } catch (error) {
        console.error('Failed to initialize auth client:', error);
      }
    };

    initAuth();
  }, []);

  const login = async () => {
    if (!authClient) return;
    
    return new Promise((resolve, reject) => {
      authClient.login({
        identityProvider: 'https://identity.ic0.app',
        onSuccess: () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal();
          setIdentity(identity);
          setPrincipal(principal);
          setIsAuthenticated(true);
          resolve(identity);
        },
        onError: (error) => {
          console.error('Login failed:', error);
          reject(error);
        }
      });
    });
  };

  const logout = async () => {
    if (!authClient) return;
    
    await authClient.logout();
    setIdentity(null);
    setPrincipal(null);
    setIsAuthenticated(false);
  };

  const value = {
    authClient,
    isAuthenticated,
    identity,
    principal,
    login,
    logout
  };

  return (
    <IdentityContext.Provider value={value}>
      {children}
    </IdentityContext.Provider>
  );
};

export default InternetIdentityProvider;