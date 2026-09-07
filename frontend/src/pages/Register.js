import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUserPlus, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const validate = () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      return 'Please enter both first name and last name.';
    }
    if (!form.username.trim()) {
      return 'Please choose a username.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email)) {
      return 'Please enter a valid email address.';
    }
    if (form.password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (form.password !== form.confirm_password) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        email: form.email,
        password: form.password,
        password2: form.confirm_password,
      });
      navigate('/predict', { replace: true });
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.detail
          ? err.response.data.detail
          : 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page blue-auth-page">
      <div className="container auth-container">
        <div className="auth-card register-card blue-auth-card card">
          <div className="auth-header">
            <h1 className="auth-title">Create an Account</h1>
            <p className="auth-subtitle">
              Register to run predictions and track your history.
            </p>
          </div>

          {error && (
            <div className="alert alert-error auth-alert">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  id="first_name"
                  type="text"
                  name="first_name"
                  className="form-input"
                  placeholder="John"
                  value={form.first_name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  id="last_name"
                  type="text"
                  name="last_name"
                  className="form-input"
                  placeholder="Doe"
                  value={form.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                className="form-input"
                placeholder="Choose a username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm_password">Confirm Password</label>
                <input
                  id="confirm_password"
                  type="password"
                  name="confirm_password"
                  className="form-input"
                  placeholder="Re-enter password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="small-inline-spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <FiUserPlus />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;