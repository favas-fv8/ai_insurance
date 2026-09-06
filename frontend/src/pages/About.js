import React, { useEffect, useState } from 'react';
import {
  FiCpu,
  FiEdit3,
  FiAward,
  FiBarChart2,
  FiCheckCircle,
} from 'react-icons/fi';
import { SiPython, SiDjango, SiReact, SiPostgresql, SiScikitlearn } from 'react-icons/si';
import { predictions } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './About.css';

const steps = [
  {
    icon: <FiEdit3 />,
    title: 'Enter Data',
    description:
      'Provide the customer age and estimated salary through the prediction form. The data is validated and prepared for analysis.',
  },
  {
    icon: <FiCpu />,
    title: 'AI Analyzes',
    description:
      'The trained machine learning models process the inputs and each algorithm produces a purchase prediction simultaneously.',
  },
  {
    icon: <FiAward />,
    title: 'Get Results',
    description:
      'The best performing model determines the final result. The outcome and full breakdown of all five models are shown instantly.',
  },
];

const technologies = [
  {
    icon: <SiPython />,
    name: 'Python',
    description: 'Core language for data processing, model training and the prediction pipeline.',
  },
  {
    icon: <SiDjango />,
    name: 'Django',
    description: 'REST framework backend that exposes the AI services through a secure JSON API.',
  },
  {
    icon: <SiReact />,
    name: 'React',
    description: 'Modern, responsive single-page application that powers the client interface.',
  },
  {
    icon: <SiPostgresql />,
    name: 'PostgreSQL',
    description: 'Relational database that stores user accounts and prediction history.',
  },
  {
    icon: <SiScikitlearn />,
    name: 'scikit-learn',
    description: 'Machine learning library used to train the five classification models.',
  },
];

const modelLabels = {
  'logistic regression': 'Logistic Regression',
  logistic_regression: 'Logistic Regression',
  knn: 'KNN',
  'k-nearest neighbors': 'KNN',
  'support vector machine': 'SVM',
  svm: 'SVM',
  'decision tree': 'Decision Tree',
  decision_tree: 'Decision Tree',
  'random forest': 'Random Forest',
  random_forest: 'Random Forest',
};

const getName = (raw) => {
  if (typeof raw !== 'string') return String(raw || '');
  const lower = raw.toLowerCase();
  return modelLabels[lower] || raw;
};

const num = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const formatPercent = (value) => {
  const parsed = num(value);
  if (parsed === null) return '-';
  const percent = parsed <= 1 ? parsed * 100 : parsed;
  return `${percent.toFixed(1)}%`;
};

const About = () => {
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    predictions
      .getModelPerformance()
      .then((response) => {
        if (mounted) setPerformance(response.data);
      })
      .catch(() => {
        if (mounted) setError('Model performance data could not be loaded right now.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const modelsDict =
    performance && performance.models && typeof performance.models === 'object'
      ? performance.models
      : {};
  const bestModelName = performance && performance.best_model ? performance.best_model : null;

  const metrics = Object.entries(modelsDict).map(([name, data]) => ({
    name: getName(name),
    accuracy: data.accuracy,
    precision: data.precision,
    recall: data.recall,
    f1_score: data.f1_score,
    isBest: name === bestModelName,
  }));

  const bestName = bestModelName ? getName(bestModelName) : null;

  return (
    <div className="page">
      <div className="container">
        <div className="about-header">
          <h1 className="page-title">About the Project</h1>
          <p className="page-subtitle">
            An end-to-end machine learning project for predicting insurance purchase decisions.
          </p>
        </div>

        <section className="about-section">
          <h2 className="about-section-title">Project Description</h2>
          <p className="about-paragraph">
            Ai-IPP is a professional machine learning application that predicts whether a
            customer will purchase an insurance product based on two key attributes: age and
            estimated salary. Five classification algorithms are trained on the Social Network
            Ads dataset and compared using accuracy, precision, recall and F1 score.
          </p>
          <p className="about-paragraph">
            The system selects the model with the highest accuracy as the production predictor,
            while still reporting the output of every algorithm so predictions can be compared
            and understood. Rooted in classic machine learning pipelines with feature scaling,
            train-test splits and decision boundary analysis, the project demonstrates a
            complete workflow from exploratory data analysis to a deployed web application.
          </p>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">How It Works</h2>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div className="step-card" key={step.title}>
                <span className="step-number">{index + 1}</span>
                <div className="step-card-icon">{step.icon}</div>
                <h3 className="step-card-title">{step.title}</h3>
                <p className="step-card-description">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">Technologies Used</h2>
          <div className="tech-grid">
            {technologies.map((tech) => (
              <div className="tech-card" key={tech.name}>
                <div className="tech-card-icon">{tech.icon}</div>
                <h3 className="tech-card-name">{tech.name}</h3>
                <p className="tech-card-description">{tech.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section">
          <div className="model-section-header">
            <h2 className="about-section-title">Model Comparison</h2>
            <p className="about-section-desc">
              Live evaluation metrics for the five classification algorithms used in the system.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading model performance..." />
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : metrics.length === 0 ? (
            <div className="alert alert-warning">
              No model performance data is available from the API.
            </div>
          ) : (
            <>
              <div className="table-card">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th>Accuracy</th>
                      <th>Precision</th>
                      <th>Recall</th>
                      <th>F1 Score</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((model) => {
                      const isBest = model.isBest;
                      return (
                        <tr key={model.name} className={isBest ? 'table-row-best' : ''}>
                          <td className="table-model">
                            {isBest && <FiAward className="trophy-icon" />}
                            {model.name}
                          </td>
                          <td className="table-metric">{formatPercent(model.accuracy)}</td>
                          <td className="table-metric">{formatPercent(model.precision)}</td>
                          <td className="table-metric">{formatPercent(model.recall)}</td>
                          <td className="table-metric">{formatPercent(model.f1_score)}</td>
                          <td>
                            {isBest ? (
                              <span className="badge badge-success">
                                <FiCheckCircle />
                                Best Model
                              </span>
                            ) : (
                              <span className="badge badge-warning">
                                <FiBarChart2 />
                                Candidate
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {bestName && (
                <div className="best-model-banner">
                  <FiCheckCircle className="best-model-icon" />
                  <div>
                    <h3 className="best-model-title">Best Model</h3>
                    <p className="best-model-text">
                      {bestName} achieves the highest accuracy and is used for production
                      predictions in the application.
                    </p>
                  </div>
                  <span className="badge badge-success">
                    <FiCpu />
                    Production Model
                  </span>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default About;