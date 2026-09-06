import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ className, size = 'medium', label = 'Loading...' }) => {
  return (
    <div className={`spinner-wrapper ${className || ''}`}>
      <div className={`spinner spinner-${size}`}></div>
      {label && <p className="spinner-label">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;