import React from 'react';
import { Link } from 'react-router-dom';
import { FiActivity, FiHeart } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-title">
            <span className="footer-brand-icon">
              <FiActivity />
            </span>
            Ai-IPP
          </div>
          <p className="footer-tagline">AI Insurance Purchase Prediction using 5 machine learning algorithms.</p>
        </div>

        <div className="footer-links">
          <span className="footer-links-title">Quick Links</span>
          <div className="footer-links-list">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/predict">Predict</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>
            &copy; {year} {process.env.REACT_APP_NAME || 'Ai-IPP'} - AI Insurance Purchase Prediction. All rights reserved.
          </p>
          <p className="footer-made">
            Built with <FiHeart /> using Python, Django, React and scikit-learn
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;