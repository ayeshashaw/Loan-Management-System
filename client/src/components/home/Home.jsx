import React from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="lendwise-app">
      {/* Header/Navigation */}
      <header className="header">
        <div className="container header-container">
          <div className="logo-container">
            <div className="logo">L</div>
            <h1 className="logo-text">LendWise</h1>
          </div>
           
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/login">
                  <button className="apply-button">Login</button>
                </Link>
                <Link to="/register">
                  <button className="apply-button">Register</button>
                </Link>
              </div>
          
          
          
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">
            <span className="hero-title-dark">Smart Financing</span><br />
            <span className="hero-title-blue">For Your Future</span>
          </h1>
          <p className="hero-subtitle">
            Apply for a loan today and get the funds you need with our fast, secure, and transparent application process.
          </p>
          <div className="hero-buttons">
          {isAuthenticated ? (
            <Link to="/apply">
              <button className="apply-button with-arrow">Apply Now</button>
            </Link>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login">
                <button className="apply-button with-arrow">Login</button>
              </Link>
              <Link to="/register">
                <button className="apply-button with-arrow">Register</button>
              </Link>
            </div>
          )}
            
            <button className="dashboard-button">View Dashboard</button>
          </div>
        </div>
      </section>

      {/* Loan Options Section */}
      <section className="loan-options-section">
        <div className="container">
          <h2 className="section-title">Find the Right Loan for You</h2>
          <p className="section-subtitle">Explore our range of loan options tailored to your needs</p>
          
          <div className="loan-cards">
            <div className="loan-card">
              <div className="loan-icon credit-card-icon">
                <i className="credit-card"></i>
              </div>
              <h3>Personal Loans</h3>
              <p>Flexible loans for any personal need with competitive rates and easy application.</p>
              <a href="#learn-more" className="learn-more">Learn more</a>
            </div>

            <div className="loan-card">
              <div className="loan-icon home-icon">
                <i className="home"></i>
              </div>
              <h3>Home Loans</h3>
              <p>Make your dream home a reality with our range of mortgage options.</p>
              <a href="#learn-more" className="learn-more">Learn more</a>
            </div>

            <div className="loan-card">
              <div className="loan-icon education-icon">
                <i className="education"></i>
              </div>
              <h3>Education Loans</h3>
              <p>Invest in your future with education financing for tuition and expenses.</p>
              <a href="#learn-more" className="learn-more">Learn more</a>
            </div>

            <div className="loan-card">
              <div className="loan-icon auto-icon">
                <i className="auto"></i>
              </div>
              <h3>Auto Loans</h3>
              <p>Get on the road with competitive auto financing for new and used vehicles.</p>
              <a href="#learn-more" className="learn-more">Learn more</a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <h2 className="section-title">Why Choose LendWise</h2>
          <p className="section-subtitle">We make the loan process simple, transparent, and tailored to your needs</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <h3>Easy Application</h3>
              <p>Apply for a loan in minutes with our streamlined online application process.</p>
            </div>

            <div className="feature-card">
              <h3>Transparent Terms</h3>
              <p>Clear, straightforward loan terms with no hidden fees or charges.</p>
            </div>

            <div className="feature-card">
              <h3>Quick Approval</h3>
              <p>Get a decision on your loan application within 24 hours.</p>
            </div>

            <div className="feature-card">
              <h3>Flexible Repayment</h3>
              <p>Choose a repayment plan that fits your financial situation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="section-title">Ready to get started?</h2>
          <p className="section-subtitle">
            Apply now and get a decision within 24 hours. Our application process is fast, secure, and designed with you in mind.
          </p>
          {isAuthenticated ? (
            <Link to="/apply">
              <button className="cta-button">Start Your Application</button>
            </Link>
          ) : (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Link to="/login">
                <button className="cta-button">Login</button>
              </Link>
              <Link to="/register">
                <button className="cta-button">Register</button>
              </Link>
            </div>
          )}
          
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-company">
              <div className="logo-container">
                <div className="logo">L</div>
                <h2 className="logo-text">LendWise</h2>
              </div>
              <p>Providing smart financing solutions for all your needs.</p>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h3>PRODUCTS</h3>
                <ul>
                  <li><a href="#personal-loans">Personal Loans</a></li>
                  <li><a href="#home-loans">Home Loans</a></li>
                  <li><a href="#education-loans">Education Loans</a></li>
                  <li><a href="#auto-loans">Auto Loans</a></li>
                </ul>
              </div>

              <div className="footer-column">
                <h3>RESOURCES</h3>
                <ul>
                  <li><a href="#dashboard">Dashboard</a></li>
                  <li><a href="#repayment">Repayment Schedule</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-copyright">
            <p>© 2025 LendWise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;