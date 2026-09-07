import React, { useCallback, useEffect, useState } from 'react';
import {
  FiRefreshCw,
  FiCpu,
  FiAward,
  FiBarChart2,
  FiDatabase,
  FiClock,
  FiActivity,
  FiAlertCircle,
  FiUsers,
  FiLayers,
} from 'react-icons/fi';
import { predictions } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import './ModelPerformance.css';

const POLL_INTERVAL = 30000;

const num = (value) => {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
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
  return `${percent.toFixed(2)}%`;
};

const formatNumber = (value) => {
  const parsed = num(value);
  if (parsed === null) return '-';
  return parsed.toLocaleString();
};

const formatDate = (value) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  return date.toLocaleString();
};

const sizeOfMatrix = (matrix) =>
  Array.isArray(matrix) &&
  matrix.length === 2 &&
  Array.isArray(matrix[0]) &&
  matrix[1] &&
  Array.isArray(matrix[1])
    ? matrix
    : [[0, 0], [0, 0]];

const ConfusionMatrix = ({ matrix }) => {
  const [[tn, fp], [fn, tp]] = sizeOfMatrix(matrix);

  return (
    <div className="cm">
      <div className="cm-head">
        <span className="cm-head-corner"></span>
        <span className="cm-head-label">Predicted: Not Purchase</span>
        <span className="cm-head-label">Predicted: Purchase</span>
      </div>
      <div className="cm-row">
        <span className="cm-row-label">Actual: Not Purchase</span>
        <div className="cm-cell cm-tn">
          <span className="cm-cell-value">{formatNumber(tn)}</span>
          <span className="cm-cell-tag">TN</span>
        </div>
        <div className="cm-cell cm-fp">
          <span className="cm-cell-value">{formatNumber(fp)}</span>
          <span className="cm-cell-tag">FP</span>
        </div>
      </div>
      <div className="cm-row">
        <span className="cm-row-label">Actual: Purchase</span>
        <div className="cm-cell cm-fn">
          <span className="cm-cell-value">{formatNumber(fn)}</span>
          <span className="cm-cell-tag">FN</span>
        </div>
        <div className="cm-cell cm-tp">
          <span className="cm-cell-value">{formatNumber(tp)}</span>
          <span className="cm-cell-tag">TP</span>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value, sub }) => (
  <div className="ai-summary-card">
    <span className="ai-summary-icon">{icon}</span>
    <div className="ai-summary-body">
      <span className="ai-summary-label">{label}</span>
      <span className="ai-summary-value">{value}</span>
      {sub && <span className="ai-summary-sub">{sub}</span>}
    </div>
  </div>
);

const ClassBar = ({ purchased, notPurchased }) => {
  const p = num(purchased) || 0;
  const n = num(notPurchased) || 0;
  const total = p + n || 1;
  const pct = Math.round((p / total) * 100);

  return (
    <div className="ai-class-bar">
      <div className="ai-class-track">
        <div className="ai-class-purchase" style={{ width: `${pct}%` }}></div>
      </div>
      <div className="ai-class-labels">
        <span className="ai-class-yes">Purchase: {formatNumber(p)}</span>
        <span className="ai-class-no">Not Purchase: {formatNumber(n)}</span>
      </div>
    </div>
  );
};

const ModelPerformance = ({ embedded = false }) => {
  const [performance, setPerformance] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    try {
      const [perf, info] = await Promise.all([
        predictions.getModelPerformance(),
        predictions.getDatasetInfo(),
      ]);
      setPerformance(perf.data);
      setDataset(info.data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      const data = err.response && err.response.data;
      setError(
        (data && data.error) ||
          (data && data.detail) ||
          'Could not load AI model performance.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (active) await load();
    };

    run();
    const interval = setInterval(run, POLL_INTERVAL);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
  };

  if (loading) {
    return (
      <section
        id="ai-performance"
        className={`ai-performance ai-performance-loading ${
          embedded ? 'ai-performance-embedded' : ''
        }`}
      >
        <div className="ai-performance-header">
          <div>
            <h2 className="main-section-title">AI Model Performance</h2>
            <p className="main-section-desc">
              Real-time metrics for every machine learning model.
            </p>
          </div>
        </div>
        <div className="card">
          <LoadingSpinner label="Loading model performance..." />
        </div>
      </section>
    );
  }

  if (error && !performance) {
    return (
      <section
        id="ai-performance"
        className={`ai-performance ${embedded ? 'ai-performance-embedded' : ''}`}
      >
        <div className="ai-performance-header">
          <div>
            <h2 className="main-section-title">AI Model Performance</h2>
            <p className="main-section-desc">
              Real-time metrics for every machine learning model.
            </p>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleRefresh}>
            <FiRefreshCw />
            Retry
          </button>
        </div>
        <div className="alert alert-error">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      </section>
    );
  }

  const models = (performance && performance.models) || {};
  const modelEntries = Object.entries(models).map(([name, m]) => ({
    name,
    confusion_matrix: m.confusion_matrix,
    accuracy: m.accuracy,
    precision: m.precision,
    recall: m.recall,
    f1_score: m.f1_score,
  }));
  const bestModel = performance ? performance.best_model : null;
  const trainingInfo = (performance && performance.training_info) || {};
  const classDistribution =
    (performance && performance.class_distribution) ||
    (dataset && dataset.class_distribution) ||
    null;
  const trainedAt = performance ? performance.trained_at : null;
  const featureNames = (performance && performance.feature_names) || (dataset && dataset.features) || [];

  return (
    <section
      id="ai-performance"
      className={`ai-performance ${embedded ? 'ai-performance-embedded' : ''}`}
    >
      <div className="ai-performance-header">
        <div>
          <h2 className="main-section-title">AI Model Performance</h2>
          <p className="main-section-desc">
            Current metrics and evaluation data for all trained models.
          </p>
        </div>
        <div className="ai-performance-actions">
          <span className="ai-live-badge">
            <FiActivity />
            Auto-refresh · 30s
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <span className="small-inline-spinner"></span>
            ) : (
              <FiRefreshCw />
            )}
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      {lastUpdated && (
        <p className="ai-last-updated">
          Last updated {lastUpdated.toLocaleTimeString()} · Last trained{' '}
          {formatDate(trainedAt)}
        </p>
      )}

      <div className="ai-summary-grid">
        <SummaryCard
          icon={<FiAward />}
          label="Best Model"
          value={bestModel || '-'}
          sub="Selected by accuracy"
        />
        <SummaryCard
          icon={<FiDatabase />}
          label="Total Samples"
          value={formatNumber(trainingInfo.total_samples)}
          sub="Full dataset size"
        />
        <SummaryCard
          icon={<FiBarChart2 />}
          label="Test Set"
          value={formatNumber(trainingInfo.test_size)}
          sub="Held-out evaluation"
        />
        <SummaryCard
          icon={<FiCpu />}
          label="Train Set"
          value={formatNumber(trainingInfo.train_size)}
          sub="Used for fitting"
        />
        <SummaryCard
          icon={<FiClock />}
          label="Last Trained"
          value={formatDate(trainedAt)}
          sub="Latest training run"
        />
      </div>

      {modelEntries.length > 0 && (
        <>
          <div className="ai-section-block">
            <div className="ai-sub-section-header">
              <h3 className="ai-sub-title">
                <FiBarChart2 />
                Model Metrics
              </h3>
              <p className="ai-sub-desc">
                Accuracy, precision, recall and F1 computed on the test set.
              </p>
            </div>

            <div className="table-card">
              <table className="table table-metrics">
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
                  {modelEntries.map((model) => {
                    const isBest =
                      String(model.name).toLowerCase() ===
                      String(bestModel).toLowerCase();
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
                            <span className="badge badge-warning">
                              <FiAward />
                              Best
                            </span>
                          ) : (
                            <span className="badge badge-muted">Active</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="ai-section-block">
            <div className="ai-sub-section-header">
              <h3 className="ai-sub-title">
                <FiLayers />
                Confusion Matrices
              </h3>
              <p className="ai-sub-desc">
                Actual vs predicted outcomes on the test set for every model.
              </p>
            </div>

            <div className="ai-cm-legend">
              <span className="ai-legend-item ai-legend-tn">TN · Correctly Not Purchase</span>
              <span className="ai-legend-item ai-legend-fp">FP · Wrongly Purchase</span>
              <span className="ai-legend-item ai-legend-fn">FN · Wrongly Not Purchase</span>
              <span className="ai-legend-item ai-legend-tp">TP · Correctly Purchase</span>
            </div>

            <div className="ai-cm-grid">
              {modelEntries.map((model) => (
                <div
                  key={model.name}
                  className={`ai-cm-card ${
                    String(model.name).toLowerCase() === String(bestModel).toLowerCase()
                      ? 'ai-cm-card-best'
                      : ''
                  }`}
                >
                  <div className="ai-cm-card-top">
                    <h4 className="ai-cm-card-name">{model.name}</h4>
                    <span className="ai-cm-card-accuracy">
                      {formatPercent(model.accuracy)} acc
                    </span>
                  </div>
                  <ConfusionMatrix matrix={model.confusion_matrix} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {dataset && (
        <div className="ai-section-block">
          <div className="ai-sub-section-header">
            <h3 className="ai-sub-title">
              <FiDatabase />
              Dataset Overview
            </h3>
            <p className="ai-sub-desc">
              Statistics from the training dataset used to build the models.
            </p>
          </div>

          <div className="ai-dataset-grid">
            <div className="card ai-dataset-card">
              <h4 className="ai-dataset-title">
                <FiUsers />
                Class Distribution
              </h4>
              {classDistribution ? (
                <ClassBar
                  purchased={classDistribution.purchased}
                  notPurchased={classDistribution.not_purchased}
                />
              ) : (
                <p className="muted">No class distribution available.</p>
              )}
              {num(dataset.purchase_rate) !== null && (
                <p className="ai-dataset-stat">
                  Purchase rate: <strong>{formatPercent(dataset.purchase_rate)}</strong>
                </p>
              )}
            </div>

            <div className="card ai-dataset-card">
              <h4 className="ai-dataset-title">
                <FiLayers />
                Features
              </h4>
              {featureNames.length > 0 ? (
                <div className="ai-feature-tags">
                  {featureNames.map((feature) => (
                    <span key={feature} className="ai-feature-tag">{feature}</span>
                  ))}
                </div>
              ) : (
                <p className="muted">No feature information available.</p>
              )}
              <p className="ai-dataset-stat">
                Total records: <strong>{formatNumber(dataset.total_records)}</strong>
              </p>
            </div>

            <div className="card ai-dataset-card">
              <h4 className="ai-dataset-title">
                <FiBarChart2 />
                Age Distribution
              </h4>
              {dataset.age_stats && (
                <div className="ai-dataset-stats-list">
                  <span>Mean <strong>{formatNumber(dataset.age_stats.mean)}</strong></span>
                  <span>Min <strong>{formatNumber(dataset.age_stats.min)}</strong></span>
                  <span>Max <strong>{formatNumber(dataset.age_stats.max)}</strong></span>
                  <span>Std Dev <strong>{formatNumber(dataset.age_stats.std)}</strong></span>
                </div>
              )}
            </div>

            <div className="card ai-dataset-card">
              <h4 className="ai-dataset-title">
                <FiActivity />
                Salary Distribution
              </h4>
              {dataset.salary_stats && (
                <div className="ai-dataset-stats-list">
                  <span>Mean <strong>{formatNumber(dataset.salary_stats.mean)}</strong></span>
                  <span>Min <strong>{formatNumber(dataset.salary_stats.min)}</strong></span>
                  <span>Max <strong>{formatNumber(dataset.salary_stats.max)}</strong></span>
                  <span>Std Dev <strong>{formatNumber(dataset.salary_stats.std)}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ModelPerformance;