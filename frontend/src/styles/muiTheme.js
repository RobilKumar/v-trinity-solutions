import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary:   { main: '#0052cc', light: '#1a70ff', dark: '#003d99' },
    secondary: { main: '#00b4d8', light: '#4dcfed', dark: '#0096b7' },
    error:     { main: '#d32f2f' },
    warning:   { main: '#ed6c02' },
    success:   { main: '#2e7d32' },
    background:{ default: '#f8faff', paper: '#ffffff' },
    text:      { primary: '#1a202c', secondary: '#4a5568' },
  },
  typography: {
    fontFamily: "'Inter', 'system-ui', sans-serif",
    h1: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
    h2: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
    h4: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
    h5: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: '10px 24px', fontSize: '0.95rem' },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0052cc 0%, #003d99 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #1a70ff 0%, #0052cc 100%)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,82,204,0.08)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0,82,204,0.15)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: '0 2px 20px rgba(0,0,0,0.1)' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
  },
});

export default theme;
