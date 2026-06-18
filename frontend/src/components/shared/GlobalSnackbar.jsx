import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { hideSnackbar } from '../../store/slices/uiSlice';

export default function GlobalSnackbar() {
  const { snackbar } = useSelector(s => s.ui);
  const dispatch = useDispatch();

  return (
    <Snackbar
      open={!!snackbar}
      autoHideDuration={4000}
      onClose={() => dispatch(hideSnackbar())}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      {snackbar && (
        <Alert severity={snackbar.severity || 'info'} onClose={() => dispatch(hideSnackbar())} variant="filled">
          {snackbar.message}
        </Alert>
      )}
    </Snackbar>
  );
}
