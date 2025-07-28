import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
// Commented out for frontend testing - uncomment when backend is ready
// import { 
//   formatPrincipal, 
//   generateRandomPrincipal, 
//   encodePrediction, 
//   createPayoutRequest,
//   generateTransactionId,
//   createBlockchainTransaction,
//   hashPrediction
// } from '../utils/dfinity-utils';

const DashboardContent = () => {
  const [predictions, setPredictions] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const { isWalletConnected } = useWallet();

  // Load predictions from localStorage
  useEffect(() => {
    const storedPredictions = JSON.parse(localStorage.getItem('malcare_predictions') || '[]');

    // Convert timestamp strings back to Date objects
    const predictionsWithDates = storedPredictions.map(p => ({
      ...p,
      timestamp: new Date(p.timestamp)
    }));

    // Add some mock predictions with different statuses if none exist
    if (predictionsWithDates.length === 0) {
      const mockPredictions = [
        {
          id: 1,
          imageId: 'IMG_001',
          result: 'Negative',
          confidence: 98.5,
          timestamp: new Date('2024-01-15T10:30:00'),
          reward: 0.05,
          status: 'completed'
        },
        {
          id: 2,
          imageId: 'IMG_002',
          result: 'Positive',
          confidence: 94.2,
          timestamp: new Date('2024-01-15T11:45:00'),
          reward: 0.08,
          status: 'completed'
        },
        {
          id: 3,
          imageId: 'IMG_003',
          result: 'Negative',
          confidence: 96.7,
          timestamp: new Date('2024-01-16T09:15:00'),
          reward: 0.06,
          status: 'pending_payout'
        },
        {
          id: 4,
          imageId: 'IMG_004',
          result: 'Positive',
          confidence: 91.3,
          timestamp: new Date('2024-01-16T14:20:00'),
          reward: 0.07,
          status: 'pending_payout'
        }
      ];
      setPredictions(mockPredictions);
      localStorage.setItem('malcare_predictions', JSON.stringify(mockPredictions));
    } else {
      setPredictions(predictionsWithDates);
    }

    const total = predictionsWithDates
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.reward, 0);
    setTotalEarnings(total);

  }, []);

  // Filter predictions based on active filter
  useEffect(() => {
    let filtered = predictions;

    switch (activeFilter) {
      case 'paid':
        filtered = predictions.filter(p => p.status === 'completed');
        break;
      case 'pending':
        filtered = predictions.filter(p => p.status === 'pending_payout');
        break;
      case 'all':
      default:
        filtered = predictions;
        break;
    }

    setFilteredPredictions(filtered);
  }, [predictions, activeFilter]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };



  const handlePayout = async (predictionId) => {
    if (!isWalletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setIsProcessingPayout(true);

    try {
      const prediction = predictions.find(p => p.id === predictionId);
      if (!prediction) {
        throw new Error('Prediction not found');
      }

      // Mock transaction 
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Generated transaction ID:', transactionId);

      // Simulate payout process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update prediction status
      setPredictions(prev =>
        prev.map(p =>
          p.id === predictionId
            ? {
              ...p,
              status: 'completed',
              transactionId: transactionId
            }
            : p
        )
      );

      // Update total earnings
      setTotalEarnings(prev => prev + prediction.reward);

      // Update localStorage
      const updatedPredictions = JSON.parse(localStorage.getItem('malcare_predictions') || '[]');
      const updatedList = updatedPredictions.map(p =>
        p.id === predictionId
          ? {
            ...p,
            status: 'completed',
            transactionId: transactionId
          }
          : p
      );
      localStorage.setItem('malcare_predictions', JSON.stringify(updatedList));

      alert(`Payout of ${prediction.reward} ICP processed successfully!\nTransaction ID: ${transactionId.slice(0, 16)}...`);
    } catch (error) {
      console.error('Payout failed:', error);
      alert('Payout failed. Please try again.');
    } finally {
      setIsProcessingPayout(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">MalCare Dashboard</h1>
        <div className="wallet-section">
          <div className="earnings-display">
            <span className="earnings-icon">💰</span>
            <div className="earnings-info">
              <div className="earnings-amount">{typeof totalEarnings === 'number' ? totalEarnings.toFixed(3) : '0.000'} ICP</div>
              <div className="earnings-label">Total Earnings</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">🔬</div>
          <div className="stat-info">
            <div className="stat-value">{predictions.length}</div>
            <div className="stat-label">Total Predictions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">
              {predictions.filter(p => p.status === 'completed').length}
            </div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-value">{typeof totalEarnings === 'number' ? totalEarnings.toFixed(3) : '0.000'} ICP</div>
            <div className="stat-label">Total Earnings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value">
              {predictions.filter(p => p.status === 'pending_payout').length}
            </div>
            <div className="stat-label">Pending Payouts</div>
          </div>
        </div>
      </div>

      <div className="predictions-section">
        <div className="predictions-header">
          <h2 className="section-title">Predictions History</h2>
          <div className="filter-tabs">
            <button
              className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All ({predictions.length})
            </button>
            <button
              className={`filter-tab ${activeFilter === 'pending' ? 'active' : ''}`}
              onClick={() => handleFilterChange('pending')}
            >
              Pending ({predictions.filter(p => p.status === 'pending_payout').length})
            </button>
            <button
              className={`filter-tab ${activeFilter === 'paid' ? 'active' : ''}`}
              onClick={() => handleFilterChange('paid')}
            >
              Paid ({predictions.filter(p => p.status === 'completed').length})
            </button>
          </div>
        </div>

        {filteredPredictions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No predictions found</h3>
            <p>
              {activeFilter === 'all'
                ? 'Start by uploading an image for malaria detection'
                : `No ${activeFilter} predictions available`
              }
            </p>
          </div>
        ) : (
          <div className="predictions-grid">
            {filteredPredictions.map(prediction => (
              <div key={prediction.id} className="prediction-card">
                <div className="prediction-header">
                  <div className="prediction-id">#{prediction.imageId}</div>
                  <div className={`prediction-status ${prediction.status}`}>
                    {prediction.status === 'completed' ? '✅ Paid' : '⏳ Pending'}
                  </div>
                </div>

                <div className="prediction-content">
                  <div className="prediction-result">
                    <div className="result-label">Result</div>
                    <div className={`result-value ${prediction.result.toLowerCase()}`}>
                      {prediction.result}
                    </div>
                  </div>

                  <div className="prediction-confidence">
                    <div className="confidence-label">Confidence</div>
                    <div className="confidence-value">{prediction.confidence}%</div>
                  </div>

                  <div className="prediction-reward">
                    <div className="reward-label">Reward</div>
                    <div className="reward-value">{prediction.reward} ICP</div>
                  </div>

                  <div className="prediction-time">
                    <div className="time-label">Date</div>
                    <div className="time-value">{formatDate(prediction.timestamp)}</div>
                  </div>
                </div>

                <div className="prediction-footer">
                  {prediction.status === 'pending_payout' && (
                    <button
                      className="payout-btn"
                      onClick={() => handlePayout(prediction.id)}
                      disabled={!isWalletConnected || isProcessingPayout}
                    >
                      {isProcessingPayout ? 'Processing...' : 'Claim Payout'}
                    </button>
                  )}
                  {prediction.status === 'completed' && prediction.transactionId && (
                    <div className="transaction-id">
                      TX: {prediction.transactionId.slice(0, 12)}...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  return <DashboardContent />;
};

export default Dashboard;