import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCpu,
  FiZap,
  FiClock,
  FiDatabase,
  FiUsers,
  FiTrendingUp,
  FiArrowRight,
  FiLayers,
} from 'react-icons/fi';
import { predictions } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Home.css';

const features = [
  {
    icon: <FiCpu />,
    title: '5 ML Algorithms',
    description:
      'Logistic Regression, KNN, SVM, Decision Tree and Random Forest are trained and compared to find the most accurate model.',
  },
  {
    icon: <FiZap />,
    title: 'Instant Predictions',
    description:
      'Enter the age and estimated salary of a customer and get a purchase prediction in real time from the best performing model.',
  },
  {
    icon: <FiClock />,
    title: 'Prediction History',
    description:
      'Every prediction is saved to your account, letting you review past results and track how customer profiles behave over time.',
  },
];

const Home = () => {
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    predictions
      .getDatasetInfo()
      .then((response) => {
        if (mounted) setDatasetInfo(response.data);
      })
      .catch(() => {
        if (mounted) setError('Dataset statistics could not be loaded right now.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const info = datasetInfo || {};
  const totalRecords = info.total_records || null;
  const classDist = info.class_distribution || {};
  const purchased = classDist.purchased || null;
  const notPurchased = classDist.not_purchased || null;
  const featureCount = info.features ? info.features.length - 1 : null;
  const ageStats = info.age_stats || {};
  const salaryStats = info.salary_stats || {};
  const ageRange = ageStats.min && ageStats.max ? `${ageStats.min} - ${ageStats.max} years` : null;
  const salaryRange = salaryStats.min && salaryStats.max
    ? `$${salaryStats.min.toLocaleString()} - $${salaryStats.max.toLocaleString()}`
    : null;
  const algorithmCount = 5;

  const stats = [
    { icon: <FiDatabase />, label: 'Dataset Records', value: totalRecords !== null ? totalRecords.toLocaleString() : '400' },
    { icon: <FiLayers />, label: 'Features Used', value: featureCount !== null ? featureCount : '2' },
    { icon: <FiCpu />, label: 'ML Algorithms', value: algorithmCount },
    { icon: <FiUsers />, label: 'Purchased', value: purchased !== null ? purchased.toLocaleString() : null },
    { icon: <FiTrendingUp />, label: 'Customers Analyzed', value: totalRecords !== null ? totalRecords.toLocaleString() : null },
  ].filter((stat) => stat.value !== null);

  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Machine Learning Classification Project
          </div>
          <h1 className="hero-title">AI-Powered Insurance Purchase Prediction</h1>
          <p className="hero-subtitle">
            Using machine learning to predict whether a customer will purchase an
            insurance product based on their age and estimated salary.
          </p>
          <div className="hero-actions">
            <Link to="/predict" className="btn btn-primary hero-btn">
              Get Started
              <FiArrowRight />
            </Link>
            <Link to="/about" className="btn btn-outline-dark hero-btn">
              Learn More
            </Link>
          </div>
          <div className="hero-stats">
            {stats.map((stat) => (
              <div className="hero-stat" key={stat.label}>
                <span className="hero-stat-icon">{stat.icon}</span>
                <div>
                  <div className="hero-stat-value">{stat.value}</div>
                  <div className="hero-stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Ai-IPP Works</h2>
            <p className="section-subtitle">
              A complete end-to-end machine learning pipeline, from data analysis to deployment.
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature) => (
              <div className="feature-card" key={feature.title}>
                <div className="feature-card-icon">{feature.icon}</div>
                <h3 className="feature-card-title">{feature.title}</h3>
                <p className="feature-card-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Five classification algorithms analyze customer data to find the best
              model for predicting insurance purchases.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading dataset statistics..." />
          ) : (
            <div className="dataset-stats">
              <div className="dataset-stats-header">
                <h3 className="dataset-stats-title">About the Dataset</h3>
                {error && <p className="dataset-stats-error">{error}</p>}
                {!error && (
                  <p className="dataset-stats-desc">
                    The model is trained on the Social Network Ads dataset with customer
                    age and estimated salary as input features.
                  </p>
                )}
              </div>
              <div className="dataset-stats-grid">
                {totalRecords !== null && (
                  <div className="dataset-stat-item">
                    <span className="dataset-stat-value">{totalRecords.toLocaleString()}</span>
                    <span className="dataset-stat-label">Total Records</span>
                  </div>
                )}
                {ageRange && (
                  <div className="dataset-stat-item">
                    <span className="dataset-stat-value">{ageRange}</span>
                    <span className="dataset-stat-label">Age Range</span>
                  </div>
                )}
                {salaryRange && (
                  <div className="dataset-stat-item">
                    <span className="dataset-stat-value">{salaryRange}</span>
                    <span className="dataset-stat-label">Salary Range</span>
                  </div>
                )}
                {featureCount !== null && (
                  <div className="dataset-stat-item">
                    <span className="dataset-stat-value">{featureCount}</span>
                    <span className="dataset-stat-label">Input Features</span>
                  </div>
                )}
                {purchased !== null && (
                  <div className="dataset-stat-item">
                    <span className="dataset-stat-value">{purchased.toLocaleString()}</span>
                    <span className="dataset-stat-label">Purchased Insurance</span>
                  </div>
                )}
                {notPurchased !== null && (
                  <div className="dataset-stat-item">
                    <span className="dataset-stat-value">{notPurchased.toLocaleString()}</span>
                    <span className="dataset-stat-label">Did Not Purchase</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="cta">
        <div className="container cta-inner">
          <h2 className="cta-title">Ready to make a prediction?</h2>
          <p className="cta-subtitle">
            Try the prediction tool and see which model performs best on your data.
          </p>
          <Link to="/predict" className="btn btn-primary cta-btn">
            Run a Prediction
            <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;