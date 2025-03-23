import axios from 'axios';
import { getAuthToken, setAuthToken } from './auth';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
// Setting withCredentials to true can sometimes cause CORS issues with Authorization headers
axios.defaults.withCredentials = true;
axios.defaults.validateStatus = status => status < 500;

// Add a request interceptor
axios.interceptors.request.use(
  config => {
    const token = getAuthToken();
    if (token) {
      // Ensure token is properly formatted with Bearer prefix
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      setAuthToken(null);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;