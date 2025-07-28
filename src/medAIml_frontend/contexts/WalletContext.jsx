import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

const WalletContextProvider = ({ children }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletUser, setWalletUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [authClient, setAuthClient] = useState(null);

  useEffect(() => {
    const init = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);

      if (client.isAuthenticated()) {
        const identity = client.getIdentity();
        const principal = identity.getPrincipal().toString();

        setIsWalletConnected(true);
        setWalletAddress(principal);
        setWalletUser(identity);
        setConnectionStatus('connected');

        persistWalletState(true, principal, identity);
      }
    };

    init();
  }, []);

  const persistWalletState = (isConnected, address, user) => {
    try {
      const walletData = {
        isConnected,
        address,
        timestamp: Date.now()
      };
      localStorage.setItem('malcare_wallet_data', JSON.stringify(walletData));
    } catch (error) {
      console.error('Failed to persist wallet state:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!authClient) {
        console.error('AuthClient not ready');
        return;
      }

      setConnectionStatus('connecting');

      await authClient.login({
        identityProvider: 'https://nfid.one/authenticate?applicationName=MalCare',
        windowOpenerFeatures: 'width=420,height=580,toolbar=0,menubar=0',
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal().toString();

          setIsWalletConnected(true);
          setWalletAddress(principal);
          setWalletUser(identity);
          setConnectionStatus('connected');

          persistWalletState(true, principal, identity);

          console.log('NFID Wallet connected:', principal);
        },
        onError: (err) => {
          console.error('Login error:', err);
          setConnectionStatus('error');
        }
      });
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setConnectionStatus('error');
    }
  };

  const disconnectWallet = async () => {
    try {
      if (authClient) {
        await authClient.logout();
      }

      setConnectionStatus('disconnected');
      setIsWalletConnected(false);
      setWalletAddress('');
      setWalletUser(null);
      localStorage.removeItem('malcare_wallet_data');

      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
    }
  };

  const getFormattedAddress = (address = walletAddress) => {
    if (!address || address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const isValidConnection = () =>
    isWalletConnected && walletUser && walletAddress && connectionStatus === 'connected';

  const getConnectionStatusMessage = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Connecting to wallet...';
      case 'connected':
        return 'Wallet connected successfully';
      case 'error':
        return 'Failed to connect wallet';
      case 'disconnected':
      default:
        return 'Wallet not connected';
    }
  };

  const value = {
    isWalletConnected,
    walletAddress,
    walletUser,
    connectionStatus,
    connectWallet,
    disconnectWallet,
    getFormattedAddress,
    isValidConnection,
    getConnectionStatusMessage
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const WalletConnector = ({ show = false }) => {
  const { connectWallet } = useWallet();

  if (!show) return null;

  return (
    <button
      onClick={connectWallet}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Connect Wallet
    </button>
  );
};

export const WalletProvider = ({ children }) => {
  return <WalletContextProvider>{children}</WalletContextProvider>;
};
