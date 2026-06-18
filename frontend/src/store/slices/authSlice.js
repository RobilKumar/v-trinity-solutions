/**
 * store/slices/authSlice.js — Redux slice for authentication state.
 *
 * State shape:
 *   user        — logged-in user object (null when unauthenticated)
 *   loading     — true while a login request is in flight
 *   initialized — set to true after fetchMe resolves; used by ProtectedRoute
 *                 to avoid redirecting before the session check completes
 *   error       — last authentication error message
 *
 * Token storage: access token (short-lived, 15 min) and refresh token
 * (7 days) are kept in localStorage. The Axios interceptor in api.js
 * automatically refreshes the access token when it expires.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

/**
 * login — POST /api/auth/login with email + password.
 * On success, stores both tokens in localStorage and returns user + token data.
 * On failure, rejects with the server's error message.
 */
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('accessToken',  data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

/**
 * fetchMe — GET /api/auth/me using the stored access token.
 * Called on app load to rehydrate the user session without a full login.
 * Sets initialized=true so ProtectedRoute knows whether to redirect.
 */
export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
  }
});

/**
 * logout — POST /api/auth/logout to revoke the refresh token in the DB,
 * then clears both tokens from localStorage regardless of server response.
 */
export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  const refreshToken = localStorage.getItem('refreshToken');
  try { await api.post('/auth/logout', { refreshToken }); } catch {}
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:        null,
    loading:     false,
    initialized: false, // false until fetchMe resolves on startup
    error:       null,
  },
  reducers: {
    // Clears the last error message (used to reset the login form error banner)
    clearError: (state) => { state.error = null; },
    // Directly sets the user (used after profile updates)
    setUser:    (state, action) => { state.user = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user    = action.payload.user;
        state.error   = null;
      })
      .addCase(login.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })
      // fetchMe success — session rehydrated, mark app as initialized
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user        = action.payload;
        state.initialized = true;
      })
      // fetchMe failure — token expired/invalid, clear session and still mark initialized
      .addCase(fetchMe.rejected, (state) => {
        state.user        = null;
        state.initialized = true;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      .addCase(logout.fulfilled, (state) => { state.user = null; });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
