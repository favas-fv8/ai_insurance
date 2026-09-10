import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiDatabase,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiCpu,
  FiUser,
  FiDollarSign,
  FiClock,
} from 'react-icons/fi';
import { predictions } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './History.css';

const formatMoney = (value) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return '-';
  return parsed.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
};

const parsePrediction = (entry) => {
  const raw =
    entry.best_model_prediction !== undefined
      ? entry.best_model_prediction
      : entry.purchased !== undefined
      ? entry.purchased
      : entry.prediction !== undefined
      ? entry.prediction
      : entry.outcome !== undefined
      ? entry.outcome
      : null;

  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'number') return raw === 1;
  if (typeof raw === 'string') {
    const lower = raw.toLowerCase();
    return ['yes', 'purchased', 'true', '1', 'y'].includes(lower)
      ? true
      : ['no', 'not purchased', 'false', '0', 'n'].includes(lower)
      ? false
      : null;
  }
  return null;
};

const getAge = (entry) => {
  const age =
    entry.age !== undefined
      ? entry.age
      : entry.input && entry.input.age !== undefined
      ? entry.input.age
      : entry.features && entry.features.age !== undefined
      ? entry.features.age
      : null;
  return age !== null && age !== undefined ? Number(age) : null;
};

const getSalary = (entry) => {
  const salary =
    entry.estimated_salary !== undefined
      ? entry.estimated_salary
      : entry.salary !== undefined
      ? entry.salary
      : entry.input && entry.input.estimated_salary !== undefined
      ? entry.input.estimated_salary
      : entry.input && entry.input.salary !== undefined
      ? entry.input.salary
      : entry.features && entry.features.estimated_salary !== undefined
      ? entry.features.estimated_salary
      : null;
  return salary !== null && salary !== undefined ? Number(salary) : null;
};

const getBestModel = (entry) => {
  const field =
    entry.best_model ||
    entry.best_model_name ||
    entry.algorithm ||
    (entry.best_model_info && entry.best_model_info.name) ||
    '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && field !== null) {
    return field.name || field.model || 'Best Model';
  }
  return 'Best Model';
};

const getTime = (entry) => {
  if (entry.created_at) return new Date(entry.created_at);
  if (entry.date) return new Date(entry.date);
  if (entry.timestamp) return new Date(entry.timestamp);
  return null;
};

const getId = (entry) =>
  entry.id !== undefined ? entry.id : entry.prediction_id !== undefined ? entry.prediction_id : entry.uuid || null;

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);

  const loadHistory = useCallback(() => {
    setLoading(true);
    setError(null);
    predictions
      .getHistory()
      .then((response) => {
        const data = response.data || [];
        const items = Array.isArray(data) ? data : data.results || data.predictions || [];
        setHistory(items);
      })
      .catch(() => {
        setError('Unable to load your prediction history.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    setError(null);
    try {
      await predictions.deletePrediction(id);
      setHistory((prev) => prev.filter((item) => getId(item) !== id));
      setConfirmId(null);
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.detail
          ? err.response.data.detail
          : 'Failed to delete the prediction.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const sortedHistory = [...history]
    .map((entry) => ({ entry, time: getTime(entry) }))
    .sort((a, b) => {
      if (a.time && b.time) return b.time.getTime() - a.time.getTime();
      if (a.time) return -1;
      if (b.time) return 1;
      return 0;
    });

  const visibleHistory = sortedHistory.slice(0, visibleCount);

  return (
    <div className="page">
      <div className="container">
        <div className="history-header">
          <div>
            <h1 className="page-title">Prediction History</h1>
            <p className="page-subtitle">
              Review all the predictions you have made with the system.
            </p>
          </div>
          <Link to="/predict" className="btn btn-primary btn-sm">
            <FiCpu />
            New Prediction
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <LoadingSpinner label="Loading prediction history..." />
        ) : sortedHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiDatabase />
            </div>
            <h3 className="empty-state-title">No predictions yet</h3>
            <p className="empty-state-text">
              When you run a prediction, it will be saved here for future review.
            </p>
            <Link to="/predict" className="btn btn-primary">
              Make Your First Prediction
            </Link>
          </div>
        ) : (
          <div className="table-card history-table-card">
            <table className="table history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date &amp; Time</th>
                  <th>Age</th>
                  <th>Estimated Salary</th>
                  <th>Result</th>
                  <th>Best Model</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleHistory.map(({ entry, time }, index) => {
                  const id = getId(entry);
                  const age = getAge(entry);
                  const salary = getSalary(entry);
                  const purchased = parsePrediction(entry);
                  const bestModel = getBestModel(entry);
                  const timeString = time
                    ? time.toLocaleDateString() + ' ' + time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Unknown';

                  return (
                    <tr key={id !== null ? id : `${age}-${salary}-${timeString}`}>
                      <td className="history-index">{index + 1}</td>
                      <td className="history-date">
                        <FiClock className="history-date-icon" />
                        {timeString}
                      </td>
                      <td className="history-number">
                        <FiUser className="history-number-icon" />
                        {age !== null ? age : '-'}
                      </td>
                      <td className="history-number">
                        <FiDollarSign className="history-number-icon" />
                        {salary !== null ? formatMoney(salary) : '-'}
                      </td>
                      <td>
                        {purchased !== null ? (
                          <span className={`badge ${purchased ? 'badge-success' : 'badge-danger'}`}>
                            {purchased ? <FiCheckCircle /> : <FiXCircle />}
                            {purchased ? 'Purchase' : 'Not Purchase'}
                          </span>
                        ) : (
                          <span className="muted">-</span>
                        )}
                      </td>
                      <td className="history-model">{bestModel}</td>
                      <td>
                        {confirmId === id ? (
                          <div className="delete-confirm">
                            <span className="delete-confirm-text">Delete this entry?</span>
                            <button
                              className="btn btn-sm btn-danger"
                              disabled={deletingId === id}
                              onClick={() => handleDelete(id)}
                            >
                              {deletingId === id ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => setConfirmId(null)}
                              disabled={deletingId === id}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline history-delete-btn"
                            onClick={() => setConfirmId(id)}
                            aria-label="Delete prediction"
                          >
                            <FiTrash2 />
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {visibleCount < sortedHistory.length && (
              <div className="history-show-more">
                <button
                  className="btn btn-primary btn-sm history-show-more-btn"
                  onClick={() => setVisibleCount((count) => count + 20)}
                >
                  Show More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;