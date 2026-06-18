import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { sidebarOpen: true, snackbar: null },
  reducers: {
    toggleSidebar:  (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, action) => { state.sidebarOpen = action.payload; },
    showSnackbar:   (state, action) => { state.snackbar = action.payload; },
    hideSnackbar:   (state) => { state.snackbar = null; },
  },
});

export const { toggleSidebar, setSidebarOpen, showSnackbar, hideSnackbar } = uiSlice.actions;
export default uiSlice.reducer;
