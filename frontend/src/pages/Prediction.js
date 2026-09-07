import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiDollarSign,
  FiCpu,
  FiAlertCircle,
  FiAward,
  FiActivity,
} from 'react-icons/fi';
import { predictions } from '../services/api';
import ModelPerformance from '../components/ModelPerformance';
import './Prediction.css';

const Prediction = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('prediction');
  const [form, setForm] = useState({
    age: '',
    salary: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validate = () => {
    const nextErrors = {};

    const age = Number(form.age);
    if (!form.age || Number.isNaN(age)) {
      nextErrors.age = 'Age is required.';
    } else if (age < 18 || age > 100) {
      nextErrors.age = 'Age must be between 18 and 100.';
    }

    const salary = Number(form.salary);
    if (!form.salary || Number.isNaN(salary)) {
      nextErrors.salary = 'Estimated salary is required.';
    } else if (salary < 0) {
      nextErrors.salary = 'Estimated salary cannot be negative.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const response = await predictions.predict({
        age: Number(form.age),
        estimated_salary: Number(form.salary),
      });
      navigate('/prediction-results', {
        state: {
          input: { age: Number(form.age), salary: Number(form.salary) },
          result: response.data,
        },
      });
    } catch (err) {
      const message =
        err.response && err.response.data && err.response.data.detail
          ? err.response.data.detail
          : 'Prediction failed. Please try again.';
      setErrors((prev) => ({ ...prev, submit: message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container prediction-container">
        <div className="prediction-tabs" role="tablist" aria-label="Prediction sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeSection === 'prediction'}
            className={`prediction-tab ${
              activeSection === 'prediction' ? 'prediction-tab-active' : ''
            }`}
            onClick={() => handleSectionChange('prediction')}
          >
            <FiCpu />
            Run a Prediction
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeSection === 'performance'}
            className={`prediction-tab ${
              activeSection === 'performance' ? 'prediction-tab-active' : ''
            }`}
            onClick={() => handleSectionChange('performance')}
          >
            <FiActivity />
            AI Model Performance
          </button>
        </div>

        <div
          role="tabpanel"
          className={`prediction-panel ${
            activeSection === 'prediction' ? '' : 'prediction-panel-hidden'
          }`}
        >
          <h1 className="page-title">Run a Prediction</h1>
          <p className="page-subtitle">
            Enter customer details to predict their likelihood of purchasing insurance.
          </p>

          <div className="prediction-grid">
            <div className="card prediction-form-card">
              <h3 className="prediction-form-title">Customer Information</h3>
              <p className="prediction-form-desc">
                The system uses age and estimated salary as input features for all five
                machine learning models.
              </p>

              {errors.submit && (
                <div className="alert alert-error prediction-alert">
                  <FiAlertCircle />
                  <span>{errors.submit}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="age">
                    <FiUser className="field-icon" />
                    Age
                  </label>
                  <input
                    id="age"
                    type="number"
                    name="age"
                    className="form-input"
                    placeholder="e.g. 35"
                    min="18"
                    max="100"
                    step="1"
                    value={form.age}
                    onChange={handleChange}
                  />
                  {errors.age && <span className="field-error">{errors.age}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="salary">
                    <FiDollarSign className="field-icon" />
                    Estimated Salary
                  </label>
                  <input
                    id="salary"
                    type="number"
                    name="salary"
                    className="form-input"
                    placeholder="e.g. 87000"
                    min="0"
                    step="1"
                    value={form.salary}
                    onChange={handleChange}
                  />
                  {errors.salary && <span className="field-error">{errors.salary}</span>}
                </div>

                <button type="submit" className="btn btn-primary prediction-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="small-inline-spinner"></span>
                      Analyzing with ML Models...
                    </>
                  ) : (
                    <>
                      <FiCpu />
                      Run Prediction
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="prediction-info">
              <div className="prediction-info-card">
                <div className="prediction-info-icon">
                  <FiAward />
                </div>
                <h4 className="prediction-info-title">How it works</h4>
                <p className="prediction-info-text">
                  Your data is scaled and passed to Logistic Regression, KNN, SVM,
                  Decision Tree and Random Forest. The highest-accuracy model decides
                  the final outcome.
                </p>
              </div>

              <div className="prediction-info-card">
                <div className="prediction-info-icon">
                  <FiCpu />
                </div>
                <h4 className="prediction-info-title">What you get</h4>
                <p className="prediction-info-text">
                  A clear purchase prediction, the output of every algorithm and the
                  model performance comparison, all stored in your history.
                </p>
              </div>

              <div className="prediction-tip">
                <FiAlertCircle />
                <p>
                  All predictions are saved to your account and can be reviewed in
                  the History section at any time.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          role="tabpanel"
          className={`prediction-panel ${
            activeSection === 'performance' ? '' : 'prediction-panel-hidden'
          }`}
        >
          <ModelPerformance embedded />
        </div>
      </div>
    </div>
  );
};

export default Prediction;