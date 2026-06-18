/**
 * services/api.js — Pre-configured Axios instance with JWT auto-refresh.
 *
 * How it works:
 *  1. Every outgoing request gets an Authorization: Bearer <accessToken> header
 *     injected by the request interceptor.
 *  2. When any response comes back with 401 + code TOKEN_EXPIRED, the response
 *     interceptor transparently calls /api/auth/refresh to get a new access token,
 *     then retries the original request — callers never see the 401.
 *  3. If multiple requests fail at the same time while a refresh is in progress,
 *     they are queued in failedQueue and all retried once the refresh succeeds
 *     (or all rejected if it fails).
 *  4. If refresh itself fails (token expired/revoked), both tokens are cleared
 *     and the user is redirected to the login page.
 */

import axios from 'axios';

// Base Axios instance — all API calls go through this object
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// REQUEST INTERCEPTOR — attach the stored access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tracks whether a refresh call is currently in flight
let isRefreshing = false;

// Holds promises for requests that arrived while a refresh was in progress
let failedQueue = [];

/**
 * processQueue — resolves or rejects all queued requests after a refresh attempt.
 * @param {Error|null} error — null on success, error object on failure
 * @param {string|null} token — new access token on success
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token));
  failedQueue = [];
};

// RESPONSE INTERCEPTOR — transparent token refresh on 401 TOKEN_EXPIRED
api.interceptors.response.use(
  // Pass through successful responses unchanged
  (res) => res,

  async (error) => {
    const orig = error.config;

    // Only attempt refresh for TOKEN_EXPIRED 401s, and only once per request
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !orig._retry) {

      // If a refresh is already running, queue this request until it finishes
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          orig.headers.Authorization = `Bearer ${token}`;
          return api(orig); // retry with new token
        });
      }

      orig._retry   = true;
      isRefreshing  = true;

      const refreshToken = localStorage.getItem('refreshToken');

      // No refresh token stored — can't refresh, redirect to login
      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        window.location.href = '/admin/login';
        return Promise.reject(error);
      }

      try {
        // Use a plain axios call (not api) to avoid triggering this interceptor again
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefresh } = data.data;

        // Persist the new tokens
        localStorage.setItem('accessToken',  accessToken);
        localStorage.setItem('refreshToken', newRefresh);

        // Update the default header so future requests use the new token
        api.defaults.headers.Authorization = `Bearer ${accessToken}`;

        // Unblock all queued requests and retry the original
        processQueue(null, accessToken);
        orig.headers.Authorization = `Bearer ${accessToken}`;
        return api(orig);

      } catch (refreshErr) {
        // Refresh failed — clear session and redirect to login
        processQueue(refreshErr, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/admin/login';
        return Promise.reject(refreshErr);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
