import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge">
          <span className="icon">🔬</span>
          Powered by AI & Blockchain
        </div>
        
        <h1 className="hero-title">
          The Future of
          <br />
          <span className="highlight">Malaria</span>
          <br />
          Detection
        </h1>
        
        <p className="hero-subtitle">
          Advanced AI-powered malaria detection system with secure blockchain authentication. 
          Upload microscopy images and get instant, accurate results.
        </p>
        
        <div className="hero-actions">
          <Link to="/upload" className="primary-btn">
            Start Detection →
          </Link>
          <button className="secondary-btn">
            ▶ Watch Demo
          </button>
        </div>
        
        <div className="hero-features">
          <div className="feature">
            <span className="check-icon">✓</span>
            No setup required
          </div>
          <div className="feature">
            <span className="check-icon">✓</span>
            AI-powered analysis
          </div>
          <div className="feature">
            <span className="check-icon">✓</span>
            Secure blockchain auth
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2 className="section-title">How PlasmoVision Works</h2>
        <p className="section-subtitle">
          Get started in minutes with our simple, powerful workflow designed for modern 
          healthcare professionals.
        </p>
        
        <div className="steps">
          <div className="step">
            <div className="step-number">01</div>
            <div className="step-icon">🔐</div>
            <h3 className="step-title">Create Account</h3>
            <p className="step-description">
              Sign up with Internet Identity for secure, decentralized authentication 
              or use Google for quick access.
            </p>
          </div>
          
          <div className="step">
            <div className="step-number">02</div>
            <div className="step-icon">📸</div>
            <h3 className="step-title">Upload Image</h3>
            <p className="step-description">
              Upload microscopy images or take photos directly with our integrated 
              camera tools for instant analysis.
            </p>
          </div>
          
          <div className="step">
            <div className="step-number">03</div>
            <div className="step-icon">🧠</div>
            <h3 className="step-title">AI Analysis</h3>
            <p className="step-description">
              Our advanced AI analyzes blood samples with high accuracy and provides 
              detailed results with confidence scores.
            </p>
          </div>
          
          <div className="step">
            <div className="step-number">04</div>
            <div className="step-icon">📊</div>
            <h3 className="step-title">Get Results</h3>
            <p className="step-description">
              Receive instant results with detailed analysis, share with your team, 
              and track patient outcomes securely.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <h2 className="section-title">About MalCare</h2>
          <p className="section-subtitle">
            Revolutionizing malaria detection through federated learning and blockchain technology.
          </p>
          
          {/* Federated Learning Diagram */}
          <div className="federated-learning-section">
            <h3 className="diagram-title">Federated Learning Architecture</h3>
            <div className="fl-diagram">
              <div className="fl-center">
                <div className="global-model">
                  <div className="model-icon">🧠</div>
                  <div className="model-label">Global AI Model</div>
                  <div className="model-accuracy">95.8% Accuracy</div>
                </div>
              </div>
              
              <div className="fl-nodes">
                <div className="fl-node hospital">
                  <div className="node-icon">🏥</div>
                  <div className="node-label">Hospital A</div>
                  <div className="node-data">2,500 samples</div>
                  <div className="connection-line"></div>
                </div>
                
                <div className="fl-node clinic">
                  <div className="node-icon">🏥</div>
                  <div className="node-label">Clinic B</div>
                  <div className="node-data">1,800 samples</div>
                  <div className="connection-line"></div>
                </div>
                
                <div className="fl-node lab">
                  <div className="node-icon">🔬</div>
                  <div className="node-label">Lab C</div>
                  <div className="node-data">3,200 samples</div>
                  <div className="connection-line"></div>
                </div>
                
                <div className="fl-node mobile">
                  <div className="node-icon">📱</div>
                  <div className="node-label">Mobile Units</div>
                  <div className="node-data">900 samples</div>
                  <div className="connection-line"></div>
                </div>
              </div>
              
              <div className="fl-process">
                <div className="process-step">
                  <div className="step-number">1</div>
                  <div className="step-text">Local Training</div>
                </div>
                <div className="process-arrow">→</div>
                <div className="process-step">
                  <div className="step-number">2</div>
                  <div className="step-text">Model Updates</div>
                </div>
                <div className="process-arrow">→</div>
                <div className="process-step">
                  <div className="step-number">3</div>
                  <div className="step-text">Global Aggregation</div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Flow */}
          <div className="workflow-section">
            <h3 className="diagram-title">MalCare Workflow</h3>
            <div className="workflow-diagram">
              <div className="workflow-step">
                <div className="step-icon upload">📸</div>
                <div className="step-content">
                  <h4>Upload Image</h4>
                  <p>Healthcare professionals upload microscopy images securely</p>
                </div>
                <div className="step-arrow">→</div>
              </div>
              
              <div className="workflow-step">
                <div className="step-icon ai">🤖</div>
                <div className="step-content">
                  <h4>AI Analysis</h4>
                  <p>Federated learning model analyzes for malaria parasites</p>
                </div>
                <div className="step-arrow">→</div>
              </div>
              
              <div className="workflow-step">
                <div className="step-icon blockchain">⛓️</div>
                <div className="step-content">
                  <h4>Blockchain Verification</h4>
                  <p>Results secured on Internet Computer Protocol</p>
                </div>
                <div className="step-arrow">→</div>
              </div>
              
              <div className="workflow-step">
                <div className="step-icon reward">💰</div>
                <div className="step-content">
                  <h4>Reward Distribution</h4>
                  <p>Contributors receive ICP tokens for quality data</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="benefits-section">
            <h3 className="diagram-title">Why Federated Learning?</h3>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">🔒</div>
                <h4>Privacy Preserved</h4>
                <p>Patient data never leaves local institutions. Only model updates are shared.</p>
              </div>
              
              <div className="benefit-card">
                <div className="benefit-icon">🌍</div>
                <h4>Global Collaboration</h4>
                <p>Healthcare institutions worldwide contribute to a shared AI model.</p>
              </div>
              
              <div className="benefit-card">
                <div className="benefit-icon">📈</div>
                <h4>Improved Accuracy</h4>
                <p>More diverse data leads to better model performance across populations.</p>
              </div>
              
              <div className="benefit-card">
                <div className="benefit-icon">⚡</div>
                <h4>Real-time Updates</h4>
                <p>Model continuously improves with each contribution from the network.</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="about-stats">
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Healthcare Partners</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95.8%</div>
              <div className="stat-label">Model Accuracy</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Data Privacy</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Global Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <h2 className="section-title">Trusted by Healthcare Professionals Worldwide</h2>
          <p className="section-subtitle">
            Join thousands of medical professionals who have transformed their malaria detection with MalCare.
          </p>
          
          <div className="testimonials-grid">
            <div className="testimonial">
              <div className="stars">★★★★★</div>
              <p className="quote">
                "MalCare revolutionized how I handle malaria diagnosis. The AI accuracy is incredible 
                and the blockchain authentication gives me peace of mind for patient data security."
              </p>
              <div className="author">
                <div className="avatar sc">SC</div>
                <div className="author-info">
                  <div className="name">Dr. Sarah Chen</div>
                  <div className="title">Chief Medical Officer</div>
                  <div className="company">Global Health Initiative</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial">
              <div className="stars">★★★★★</div>
              <p className="quote">
                "The speed and accuracy of MalCare's detection system helped me provide better care 
                to my patients. The instant results keep me motivated to deliver excellent service."
              </p>
              <div className="author">
                <div className="avatar mr">MR</div>
                <div className="author-info">
                  <div className="name">Dr. Mike Rodriguez</div>
                  <div className="title">Infectious Disease Specialist</div>
                  <div className="company">Regional Medical Center</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial">
              <div className="stars">★★★★★</div>
              <p className="quote">
                "Finally, a platform that understands healthcare needs. The secure authentication 
                and professional analysis tools make MalCare indispensable for our clinic."
              </p>
              <div className="author">
                <div className="avatar aj">AJ</div>
                <div className="author-info">
                  <div className="name">Dr. Alex Johnson</div>
                  <div className="title">Laboratory Director</div>
                  <div className="company">Community Health Labs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;