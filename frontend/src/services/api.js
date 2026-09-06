import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const ACCESS_TOKEN_KEY = 'aiipp_access_token';
const REFRESH_TOKEN_KEY = 'aiipp_refresh_token';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const redirectToLogin = () => {
  const currentLocation = window.location.pathname;
  const redirect = currentLocation && currentLocation !== '/login' ? currentLocation : '';
  window.location.href = `/login${redirect ? `?next=${encodeURIComponent(redirect)}` : ''}`;
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
    refresh: refreshToken,
  });
  return response.data.access;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login/') &&
      !originalRequest.url.includes('/auth/register/') &&
      !originalRequest.url.includes('/auth/token/refresh/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const getErrorMessage = (error, fallback) => {
  if (
    error.response &&
    error.response.data &&
    error.response.data.detail
  ) {
    return error.response.data.detail;
  }
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (typeof data === 'string') {
      return data;
    }
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const first = data[firstKey];
      if (Array.isArray(first)) {
        return `${firstKey}: ${first[0]}`;
      }
      if (typeof first === 'object' && first !== null) {
        const nestedKey = Object.keys(first)[0];
        return `${firstKey}.${nestedKey}: ${first[nestedKey]}`;
      }
      return String(first);
    }
  }
  if (error.message && error.message.includes('Network Error')) {
    return 'Unable to reach the server. Please try again later.';
  }
  return fallback;
};

export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('aiipp_user');
};

const auth = {
  login: (data) => api.post('/auth/login/', data),
  register: (data) => api.post('/auth/register/', data),
  logout: () => api.post('/auth/logout/', {
    refresh: localStorage.getItem(REFRESH_TOKEN_KEY) || '',
  }),
};

const user = {
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
};

const predictions = {
  predict: (data) => api.post('/predictions/predict/', data),
  getHistory: () => api.get('/predictions/history/'),
  deletePrediction: (id) => api.delete(`/predictions/history/${id}/`),
  getModelPerformance: () => api.get('/predictions/model-performance/'),
  getDatasetInfo: () => api.get('/predictions/dataset-info/'),
};

export { api, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, auth, user, predictions };
export default api;