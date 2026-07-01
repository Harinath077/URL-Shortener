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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Interceptor to handle 401 Unauthorized errors and perform automatic token refresh
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // If 401 occurs and it is not a retry and not a login/refresh request
    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        processQueue(refreshErr);

        // Revoke state if refresh token is also invalid or expired
        localStorage.removeItem('user_info');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
