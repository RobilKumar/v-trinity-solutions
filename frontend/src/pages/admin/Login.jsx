import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Button, Alert, CircularProgress, Box, Typography, InputAdornment, IconButton } from '@mui/material';
import { login, clearError } from '../../store/slices/authSlice';

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (user) navigate('/admin');
  }, [user, navigate]);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (!result.error) navigate('/admin');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1b3e 100%)',
      px: 2,
    }}>
      {/* BG orb */}
      <Box sx={{ position: 'absolute', top: '20%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,82,204,0.2), transparent)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <Box sx={{
        width: '100%', maxWidth: 420,
        bgcolor: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 3,
        p: 4,
        position: 'relative',
      }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: 2, background: 'linear-gradient(135deg, #0052cc, #00b4d8)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800 }}>T</Typography>
          </Box>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>Admin Login</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>V-Trinity Solutions CMS</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth label="Email Address" type="email" required autoFocus
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.07)', color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' } }}
          />
          <TextField
            fullWidth label="Password" required
            type={showPass ? 'text' : 'password'}
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPass(s => !s)} sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    {showPass ? '🙈' : '👁️'}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.07)', color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' } }}
          />
          <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
            sx={{ py: 1.5, background: 'linear-gradient(135deg, #0052cc, #003d99)', fontWeight: 600, fontSize: '1rem' }}>
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
          </Button>
        </form>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'rgba(255,255,255,0.3)' }}>
          🔒 Secure admin access only
        </Typography>
      </Box>
    </Box>
  );
}


