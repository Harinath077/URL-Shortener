import axios from 'axios';

// Dev:  baseURL = '/api'  → Vite proxy forwards to localhost:8080 (no CORS)
// Prod: set VITE_BACKEND_URL=https://your-backend.onrender.com in your host env
const baseURL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true, // sends the HttpOnly jwt cookie automatically on every request
});

// Read a cookie value by name.
// Spring Security sets XSRF-TOKEN (not HttpOnly) so JS can read it.
function getCookie(name) {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

// Attach CSRF token on every state-changing request (POST, PUT, DELETE).
// Spring verifies that the X-XSRF-TOKEN header value matches the XSRF-TOKEN cookie.
// A cross-origin attacker cannot read the cookie (SameSite + CORS), so the check passes
// only for requests originating from our own frontend.
api.interceptors.request.use((config) => {
  const csrfToken = getCookie('XSRF-TOKEN');
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }
  return config;
});

// On 401 — clear stale user state and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('user_info');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
