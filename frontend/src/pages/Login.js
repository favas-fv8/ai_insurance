import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiLogIn, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!form.username.trim() || !form.password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await login(form);
      const redirect =
        location.state && location.state.from ? location.state.from : '/predict';
      const destination =
        response && response.needs_profile ? '/profile' : redirect;
      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.detail
          ? err.response.data.detail
          : 'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page blue-auth-page">
      <div className="container auth-container">
        <div className="auth-card login-card blue-auth-card card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              Sign in to access predictions and your history.
            </p>
          </div>

          {error && (
            <div className="alert alert-error auth-alert">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                className="form-input"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner small-inline-spinner"></span>
                  Signing In...
                </>
              ) : (
                <>
                  <FiLogIn />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="auth-footer">
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;