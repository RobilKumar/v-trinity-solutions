import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth:     authReducer,
    settings: settingsReducer,
    ui:       uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
