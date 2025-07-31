import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet, WalletConnector } from '../contexts/WalletContext';
import AuthModal from './AuthModal';
import { useIdentity } from './InternetIdentityProvider';
import googleAuthService from '../services/googleAuth';

const Header = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWalletConnector, setShowWalletConnector] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const { 
    isWalletConnected, 
    walletAddress, 
    connectWallet, 
    disconnectWallet, 
    getFormattedAddress,
    connectionStatus,
    getConnectionStatusMessage 
  } = useWallet();
  const { isAuthenticated, principal, logout } = useIdentity();

  useEffect(() => {
    // Check for Google user in localStorage
    const storedGoogleUser = localStorage.getItem('malcare_google_user');
    if (storedGoogleUser) {
      setGoogleUser(JSON.parse(storedGoogleUser));
    }
  }, []);

  const handleAboutClick = (e) => {
    e.preventDefault();
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleLogout = async () => {
    try {
      // Logout from Internet Identity
      if (isAuthenticated) {
        logout();
      }
      
      // Logout from Google using the auth service
      if (googleUser) {
        googleAuthService.signOut();
        setGoogleUser(null);
      }
      
      alert('Logged out successfully!');
      
      // Refresh the page to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  const isLoggedIn = isAuthenticated || googleUser;

  return (
    <>
      <header className="header">
        <Link to="/" className="logo">
          <div className="logo-icon">M</div>
          PlasmoVision
        </Link>
        
        <nav className="nav">
          <Link to="/">Features</Link>
          <Link to="/">How It Works</Link>
          <a href="#about" onClick={handleAboutClick}>About</a>
          <Link to="/upload">Upload</Link>
          <Link to="/dashboard">Dashboard</Link>
          <div className="wallet-nav">
            {isWalletConnected ? (
              <div className="wallet-connected-nav">
                <span className="wallet-icon">
                  {connectionStatus === 'connecting' ? '🔄' : '✅'}
                </span>
                <span className="wallet-text">
                  {getFormattedAddress()}
                </span>
                <button 
                  className="disconnect-btn-nav"
                  onClick={disconnectWallet}
                  title="Disconnect wallet"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="wallet-connect-container">
                <button 
                  className="connect-wallet-btn"
                  onClick={() => setShowWalletConnector(true)}
                >
                  Connect Wallet
                </button>
                {connectionStatus === 'error' && (
                  <div className="wallet-error-message">
                    {getConnectionStatusMessage()}
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
        
        <div className="auth-buttons">
          {isLoggedIn ? (
            <div className="user-info">
              <div className="user-details">
                {googleUser ? (
                  <>
                    <div className="user-avatar">
                      <img 
                        src={googleUser.picture} 
                        alt={googleUser.name}
                        className="profile-photo"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/32/ff6b35/ffffff?text=' + googleUser.name.charAt(0);
                        }}
                      />
                    </div>
                    <div className="user-text">
                      <span className="user-name">{googleUser.name}</span>
                      <span className="auth-type">Google</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="user-avatar">
                      <div className="icp-avatar">🌐</div>
                    </div>
                    <div className="user-text">
                      <span className="user-name">{principal?.toString().slice(0, 8)}...</span>
                      <span className="auth-type">Internet Identity</span>
                    </div>
                  </>
                )}
              </div>
              <button 
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button 
                className="sign-in-btn"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In
              </button>
              <button 
                className="get-started-btn"
                onClick={() => setShowAuthModal(true)}
              >
                Get Started Free
              </button>
            </>
          )}
        </div>
      </header>
      
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
      
      {showWalletConnector && (
        <div className="wallet-modal-overlay" onClick={() => setShowWalletConnector(false)}>
          <div className="wallet-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="wallet-modal-header">
              <h3>Connect Your Wallet</h3>
              <button 
                className="wallet-modal-close"
                onClick={() => setShowWalletConnector(false)}
              >
                ×
              </button>
            </div>
            <WalletConnector 
              show={showWalletConnector}
              onConnect={(user) => {
                connectWallet(user);
                setShowWalletConnector(false);
              }}
              onDisconnect={disconnectWallet}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;