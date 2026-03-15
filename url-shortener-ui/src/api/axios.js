import axios from 'axios';

// Dev:  baseURL = '/api'  → Vite proxy forwards to localhost:8080 (no CORS)
// Prod: set VITE_BACKEND_URL=https://your-backend.onrender.com in your host env
const baseURL = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : '/api';

const api = axios.create({ baseURL });

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 — clear stale credentials and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_info');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
