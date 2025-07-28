import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from '../contexts/WalletContext';
import InternetIdentityProvider from '../components/InternetIdentityProvider';
import Header from '../components/Header';
import HomePage from '../pages/HomePage';
import ImageUpload from '../components/ImageUpload';
import Dashboard from '../pages/Dashboard';

function App() {
  return (
    <WalletProvider>
      <InternetIdentityProvider>
        <Router>
          <div className="App">
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/upload" element={<ImageUpload />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </div>
        </Router>
      </InternetIdentityProvider>
    </WalletProvider>
  );
}

export default App;