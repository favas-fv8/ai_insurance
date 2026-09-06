import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiAlertCircle,
  FiCheckCircle,
  FiLock,
} from 'react-icons/fi';
import { user as userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ChangePassword.css';

const ChangePassword = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const validate = () => {
    if (!form.current_password) {
      return 'Please enter your current password.';
    }
    if (form.new_password.length < 8) {
      return 'New password must be at least 8 characters long.';
    }
    if (form.new_password !== form.confirm_password) {
      return 'New passwords do not match.';
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword({
        old_password: form.current_password,
        new_password: form.new_password,
      });
      await logout();
      setSuccess('Your password was changed successfully. Please sign in again.');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.detail
          ? err.response.data.detail
          : 'Failed to change password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="container auth-container">
        <div className="auth-card card">
          <div className="auth-header">
            <h1 className="auth-title">Change Password</h1>
            <p className="auth-subtitle">
              Choose a new password to secure your account.
            </p>
          </div>

          {error && (
            <div className="alert alert-error auth-alert">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success auth-alert">
              <FiCheckCircle />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="current_password">Current Password</label>
              <input
                id="current_password"
                type="password"
                name="current_password"
                className="form-input"
                placeholder="Enter current password"
                value={form.current_password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="new_password">New Password</label>
              <input
                id="new_password"
                type="password"
                name="new_password"
                className="form-input"
                placeholder="At least 8 characters"
                value={form.new_password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password">Confirm New Password</label>
              <input
                id="confirm_password"
                type="password"
                name="confirm_password"
                className="form-input"
                placeholder="Re-enter new password"
                value={form.confirm_password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="small-inline-spinner"></span>
                  Updating...
                </>
              ) : (
                <>
                  <FiLock />
                  Update Password
                </>
              )}
            </button>
          </form>

          <p className="auth-footer">
            <Link to="/profile" className="back-link">
              <FiArrowLeft />
              Back to Profile
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;