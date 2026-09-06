import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  user as userService,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  logout as clearStoredAuth,
  getErrorMessage,
} from '../services/api';

const USER_KEY = 'aiipp_user';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem(ACCESS_TOKEN_KEY)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    userService
      .getProfile()
      .then((response) => {
        setUser(response.data);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data));
      })
      .catch(() => {
        setUser(null);
        setAccessToken(null);
        clearStoredAuth();
      })
      .finally(() => setLoading(false));
  }, [accessToken]);

  const login = async (credentials) => {
    setError(null);
    try {
      const response = await auth.login(credentials);
      const data = response.data;
      const token = data.access || data.access_token || data.token;
      const refresh = data.refresh || data.refresh_token;
      const loggedUser = data.user || data.profile || null;

      if (token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
        setAccessToken(token);
      }
      if (refresh) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
      }
      if (loggedUser) {
        setUser(loggedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(loggedUser));
      }
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err, 'Login failed. Please check your credentials.');
      setError(message);
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await auth.register(userData);
      const data = response.data;
      const token = data.tokens?.access || data.access || data.access_token || data.token;
      const refresh = data.tokens?.refresh || data.refresh || data.refresh_token;
      const registeredUser = data.user || data.profile || null;

      if (token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
        setAccessToken(token);
      }
      if (refresh) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
      }
      if (registeredUser) {
        setUser(registeredUser);
        localStorage.setItem(USER_KEY, JSON.stringify(registeredUser));
      }
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err, 'Registration failed. Please try again.');
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch (err) {
      // Ignore failed logout request; always clear local state.
    }
    clearStoredAuth();
    setUser(null);
    setAccessToken(null);
    setError(null);
  };

  const updateProfile = async (data) => {
    setError(null);
    try {
      const response = await userService.updateProfile(data);
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to update profile.');
      setError(message);
      throw err;
    }
  };

  const isAuthenticated = Boolean(accessToken);

  const value = {
    user,
    setUser,
    accessToken,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;