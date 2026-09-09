import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiAtSign,
  FiSave,
  FiAlertCircle,
  FiCheckCircle,
  FiLock,
  FiCalendar,
} from 'react-icons/fi';
import { user as userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './Profile.css';

const Profile = () => {
  const { user: contextUser, updateProfile } = useAuth();
  const [profile, setProfile] = useState(contextUser);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!success && !error) return;
    const timer = setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [success, error]);

  useEffect(() => {
    let mounted = true;
    userService
      .getProfile()
      .then((response) => {
        if (!mounted) return;
        setProfile(response.data);
        setForm({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          email: response.data.email || '',
        });
      })
      .catch(() => {
        if (mounted) setError('Unable to load your profile.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('First name and last name are required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
      });
      setSuccess('Your profile has been updated successfully.');
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.detail
          ? err.response.data.detail
          : 'Failed to update profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <LoadingSpinner label="Loading your profile..." />
        </div>
      </div>
    );
  }

  const name = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username || 'Account'
    : 'Account';
  const username = profile ? profile.username || '---' : '---';
  const email = profile ? profile.email || '---' : '---';
  const memberSince = profile && profile.date_joined
    ? new Date(profile.date_joined).toLocaleDateString()
    : null;

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account information.</p>

        <div className="profile-grid">
          <div className="profile-sidebar card">
            <div className="profile-avatar">
              {name.charAt(0).toUpperCase()}
            </div>
            <h2 className="profile-name">{name}</h2>
            <p className="profile-username">@{username}</p>

            <div className="profile-details">
              <div className="profile-detail">
                <FiUser className="profile-detail-icon" />
                <div>
                  <span className="profile-detail-label">Full Name</span>
                  <span className="profile-detail-value">{name}</span>
                </div>
              </div>
              <div className="profile-detail">
                <FiMail className="profile-detail-icon" />
                <div>
                  <span className="profile-detail-label">Email</span>
                  <span className="profile-detail-value">{email}</span>
                </div>
              </div>
              <div className="profile-detail">
                <FiAtSign className="profile-detail-icon" />
                <div>
                  <span className="profile-detail-label">Username</span>
                  <span className="profile-detail-value">{username}</span>
                </div>
              </div>
              {memberSince && (
                <div className="profile-detail">
                  <FiCalendar className="profile-detail-icon" />
                  <div>
                    <span className="profile-detail-label">Member Since</span>
                    <span className="profile-detail-value">{memberSince}</span>
                  </div>
                </div>
              )}
            </div>

            <Link to="/change-password" className="btn btn-outline profile-password-btn">
              <FiLock />
              Change Password
            </Link>
          </div>

          <div className="card profile-form-card">
            <h3 className="profile-form-title">Edit Profile</h3>
            <p className="profile-form-desc">
              Keep your personal information up to date.
            </p>

            {error && (
              <div className="alert alert-error profile-alert">
                <FiAlertCircle />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="alert alert-success profile-alert">
                <FiCheckCircle />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  id="first_name"
                  type="text"
                  name="first_name"
                  className="form-input"
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
                  value={form.last_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="form-input"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className="small-inline-spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;