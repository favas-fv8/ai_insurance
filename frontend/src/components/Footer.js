import React from 'react';
import { Link } from 'react-router-dom';
import version from '../version';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-title">
            <span className="footer-brand-icon">
              <img src={`${process.env.PUBLIC_URL}/hero.png`} alt="Ai-IPP" />
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
          <p>&copy; {new Date().getFullYear()} Ai-IPP</p>
          <p className="footer-version">Version {version}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;