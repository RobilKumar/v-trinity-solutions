import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchPublicSettings = createAsyncThunk('settings/fetchPublic', async () => {
  const { data } = await api.get('/public/settings');
  return data.data;
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState: { settings: {}, socialLinks: [], locations: [], loaded: false },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPublicSettings.fulfilled, (state, action) => {
      state.settings    = action.payload.settings || {};
      state.socialLinks = action.payload.socialLinks || [];
      state.locations   = action.payload.locations || [];
      state.loaded      = true;
    });
  },
});

export default settingsSlice.reducer;
