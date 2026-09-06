import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import {
  FiCheckCircle,
  FiXCircle,
  FiCpu,
  FiRefreshCw,
  FiClock,
  FiAward,
  FiBarChart2,
  FiUser,
  FiDollarSign,
} from 'react-icons/fi';
import './PredictionResults.css';

const modelLabels = {
  'logistic regression': 'Logistic Regression',
  logistic_regression: 'Logistic Regression',
  'logistic regression classifier': 'Logistic Regression',
  knn: 'KNN',
  'knn classifier': 'KNN',
  'k-nearest neighbors': 'KNN',
  'support vector machine': 'SVM',
  'svm classifier': 'SVM',
  'svc': 'SVM',
  'decision tree': 'Decision Tree',
  'decision tree classifier': 'Decision Tree',
  'random forest': 'Random Forest',
  'random forest classifier': 'Random Forest',
};

const getName = (raw) => {
  if (typeof raw !== 'string') return String(raw || '');
  const lower = raw.trim().toLowerCase();
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

const formatMoney = (value) => {
  const parsed = num(value);
  if (parsed === null) return '-';
  return parsed.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
};

const formatPercent = (value) => {
  const parsed = num(value);
  if (parsed === null) return '-';
  const percent = parsed <= 1 ? parsed * 100 : parsed;
  return `${percent.toFixed(1)}%`;
};

const isPurchasedResult = (value, predictionsMap) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'yes' || lower === 'purchased' || lower === 'true' || lower === '1' || lower === 'y') {
      return true;
    }
    if (lower === 'no' || lower === 'not purchased' || lower === 'false' || lower === '0' || lower === 'n') {
      return false;
    }
  }
  if (predictionsMap) {
    return isPurchasedFromMap(predictionsMap);
  }
  return null;
};

const isPurchasedFromMap = (predictionsMap) => {
  const values = Object.values(predictionsMap);
  const booleans = values
    .map((value) => (typeof value === 'boolean' ? value : null))
    .filter((value) => value !== null);
  if (booleans.length) {
    const yes = booleans.filter(Boolean).length;
    const no = booleans.filter((value) => !value).length;
    return yes > no;
  }
  const numeric = values
    .map((value) => (typeof value === 'number' && (value === 0 || value === 1) ? value : null))
    .filter((value) => value !== null);
  if (numeric.length) {
    const ones = numeric.filter((value) => value === 1).length;
    return ones > numeric.length - ones;
  }
  const yesCount = values.filter((value) =>
    ['yes', 'purchased', 'true', '1', 'y'].includes(String(value).toLowerCase())
  ).length;
  const noCount = values.filter((value) =>
    ['no', 'not purchased', 'false', '0', 'n'].includes(String(value).toLowerCase())
  ).length;
  return yesCount > noCount;
};

const PredictionResults = () => {
  const location = useLocation();
  const state = location.state;

  if (!state || !state.input || !state.result) {
    return <Navigate to="/predict" replace />;
  }

  const { age, salary } = state.input;
  const result = state.result;

  const rawPredictions =
    result.model_predictions ||
    result.predictions ||
    result.all_predictions ||
    result.results ||
    {};

  const bestModelNameField =
    result.best_model ||
    result.best_model_name ||
    result.best_algorithm ||
    (result.best_model_info && result.best_model_info.name) ||
    '';
  const bestModelName = typeof bestModelNameField === 'string' ? getName(bestModelNameField) : 'Best Model';

  const purchasedRaw =
    result.purchased !== undefined
      ? result.purchased
      : result.prediction !== undefined
      ? result.prediction
      : result.outcome !== undefined
      ? result.outcome
      : null;

  const purchased = isPurchasedResult(purchasedRaw, rawPredictions);

  const bestAccuracy = num(result.best_model_accuracy || result.accuracy || result.best_accuracy);
  const confidence = num(result.confidence || result.probability);

  const bestModel =
    result.best_model_info && typeof result.best_model_info === 'object'
      ? result.best_model_info
      : null;

  let modelList = [];
  if (Array.isArray(rawPredictions)) {
    modelList = rawPredictions.map((entry, index) => {
      const entryPredictions = entry.predictions || entry.values || {};
      const firstValue =
        entry.prediction !== undefined
          ? entry.prediction
          : entry.name
          ? null
          : Object.values(entryPredictions)[0];
      return {
        name: getName(entry.name || entry.model || entry.model_name),
        prediction: entry.prediction !== undefined ? entry.prediction : firstValue,
        accuracy: num(entry.accuracy),
        precision: num(entry.precision),
        recall: num(entry.recall),
        f1: num(entry.f1 || entry.f1_score),
        isBest: String(entry.name || entry.model || entry.model_name || '').toLowerCase() === String(bestModelNameField).toLowerCase(),
      };
    });
  } else if (rawPredictions && typeof rawPredictions === 'object') {
    modelList = Object.entries(rawPredictions).map(([key, value]) => {
      const entry =
        value && typeof value === 'object'
          ? {
              name: getName(key),
              prediction: value.prediction !== undefined ? value.prediction : null,
              accuracy: num(value.accuracy),
              precision: num(value.precision),
              recall: num(value.recall),
              f1: num(value.f1 || value.f1_score),
              isBest: String(key).toLowerCase() === String(bestModelNameField).toLowerCase(),
            }
          : {
              name: getName(key),
              prediction: value,
              accuracy: null,
              precision: null,
              recall: null,
              f1: null,
              isBest: String(key).toLowerCase() === String(bestModelNameField).toLowerCase(),
            };
      return entry;
    });
  }

  const bestDecisionModel =
    modelList.find((model) => model.isBest) || (bestModel ? {
      name: getName(bestModel.name || bestModel.model),
      prediction: bestModel.prediction !== undefined ? bestModel.prediction : null,
      accuracy: num(bestModel.accuracy),
      precision: num(bestModel.precision),
      recall: num(bestModel.recall),
      f1: num(bestModel.f1 || bestModel.f1_score),
      isBest: true,
    } : null);

  const displayPrediction =
    purchased !== null
      ? purchased
      : bestDecisionModel && bestDecisionModel.prediction !== undefined
      ? isPurchasedResult(bestDecisionModel.prediction)
      : bestModel && bestModel.prediction !== undefined
      ? isPurchasedResult(bestModel.prediction)
      : null;

  const hasMetrics = modelList.some(
    (model) => model.accuracy !== null || model.precision !== null || model.recall !== null || model.f1 !== null
  );

  const timestamp = result.created_at || result.timestamp || result.date || null;

  return (
    <div className="page">
      <div className="container results-container">
        <div className="results-header">
          <div>
            <h1 className="page-title">Prediction Result</h1>
            <p className="page-subtitle">Complete analysis of this customer profile.</p>
          </div>
          <div className="results-actions">
            <Link to="/history" className="btn btn-outline btn-sm">
              <FiClock />
              Back to History
            </Link>
            <Link to="/predict" className="btn btn-primary btn-sm">
              <FiRefreshCw />
              New Prediction
            </Link>
          </div>
        </div>

        <div className="results-summary">
          <div className="result-summary-item">
            <span className="result-summary-icon">
              <FiUser />
            </span>
            <div>
              <span className="result-summary-label">Age</span>
              <span className="result-summary-value">{num(age)}</span>
            </div>
          </div>
          <div className="result-summary-item">
            <span className="result-summary-icon">
              <FiDollarSign />
            </span>
            <div>
              <span className="result-summary-label">Estimated Salary</span>
              <span className="result-summary-value">{formatMoney(salary)}</span>
            </div>
          </div>
          <div className="result-summary-item">
            <span className="result-summary-icon">
              <FiCpu />
            </span>
            <div>
              <span className="result-summary-label">Best Model</span>
              <span className="result-summary-value">{bestModelName}</span>
            </div>
          </div>
          {bestAccuracy !== null && (
            <div className="result-summary-item">
              <span className="result-summary-icon">
                <FiBarChart2 />
              </span>
              <div>
                <span className="result-summary-label">Model Accuracy</span>
                <span className="result-summary-value">{formatPercent(bestAccuracy)}</span>
              </div>
            </div>
          )}
        </div>

        {displayPrediction !== null && (
          <div className={`result-hero ${displayPrediction ? 'result-hero-purchased' : 'result-hero-not-purchased'}`}>
            <div className="result-hero-icon">
              {displayPrediction ? <FiCheckCircle /> : <FiXCircle />}
            </div>
            <div>
              <h2 className="result-hero-title">
                {displayPrediction ? 'Customer is likely to purchase' : 'Customer is unlikely to purchase'}
              </h2>
              <p className="result-hero-text">
                {displayPrediction
                  ? 'The best performing model predicts this customer will purchase the insurance product.'
                  : 'The best performing model predicts this customer will not purchase the insurance product.'}
              </p>
              {confidence !== null && (
                <p className="result-hero-confidence">
                  Confidence: {formatPercent(confidence)}
                </p>
              )}
            </div>
            <span className={`badge ${displayPrediction ? 'badge-success' : 'badge-danger'} result-hero-badge`}>
              {displayPrediction ? 'Purchased' : 'Not Purchased'}
            </span>
          </div>
        )}

        {modelList.length > 0 && (
          <section className="results-section">
            <div className="results-section-header">
              <h2 className="results-section-title">All Model Predictions</h2>
              <p className="results-section-desc">
                The output of every machine learning algorithm for this customer.
              </p>
            </div>
            <div className="model-predictions-grid">
              {modelList.map((model) => {
                const modelPrediction = isPurchasedResult(model.prediction);
                return (
                  <div
                    key={model.name}
                    className={`model-prediction-card ${model.isBest ? 'model-prediction-best' : ''}`}
                  >
                    <div className="model-prediction-top">
                      <h3 className="model-prediction-name">{model.name}</h3>
                      {model.isBest && (
                        <span className="badge badge-warning">
                          <FiAward />
                          Best
                        </span>
                      )}
                    </div>
                    {modelPrediction !== null && (
                      <div className={`model-prediction-outcome ${modelPrediction ? 'outcome-yes' : 'outcome-no'}`}>
                        {modelPrediction ? (
                          <>
                            <FiCheckCircle />
                            Purchased
                          </>
                        ) : (
                          <>
                            <FiXCircle />
                            Not Purchased
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {hasMetrics && (
          <section className="results-section">
            <div className="results-section-header">
              <h2 className="results-section-title">Model Performance</h2>
              <p className="results-section-desc">
                Evaluation metrics used to select the best model.
              </p>
            </div>
            <div className="table-card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Accuracy</th>
                    <th>Precision</th>
                    <th>Recall</th>
                    <th>F1 Score</th>
                  </tr>
                </thead>
                <tbody>
                  {modelList.map((model) => (
                    <tr key={model.name} className={model.isBest ? 'table-row-best' : ''}>
                      <td className="table-model">
                        {model.isBest && <FiAward className="trophy-icon" />}
                        {model.name}
                      </td>
                      <td className="table-metric">{formatPercent(model.accuracy)}</td>
                      <td className="table-metric">{formatPercent(model.precision)}</td>
                      <td className="table-metric">{formatPercent(model.recall)}</td>
                      <td className="table-metric">{formatPercent(model.f1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {!modelList.length && displayPrediction === null && (
          <div className="alert alert-warning">
            The prediction result response could not be parsed. Please try a new prediction.
          </div>
        )}

        {timestamp && (
          <p className="results-timestamp">Prediction recorded at {new Date(timestamp).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
};

export default PredictionResults;