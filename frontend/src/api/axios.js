import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('dl_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, err => Promise.reject(err));

// Response interceptor - handle 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dl_token');
      localStorage.removeItem('dl_user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname === '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
