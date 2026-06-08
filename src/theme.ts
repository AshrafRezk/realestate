import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  direction: 'ltr',
  palette: {
    primary: {
      main: '#003527',
      light: '#0b513d',
      dark: '#002117',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d4af37',
      light: '#e9c349',
      dark: '#735c00',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f7f9fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#191c1e',
      secondary: '#404944',
    },
    success: {
      main: '#2b6954',
      light: '#b0f0d6',
    },
    warning: {
      main: '#d4af37',
      light: '#fff8e1',
    },
    error: {
      main: '#ba1a1a',
      light: '#ffdad6',
    },
    divider: '#bfc9c3',
  },
  typography: {
    fontFamily: '"Inter", "PP Telegraf", system-ui, sans-serif',
    h1: {
      fontFamily: '"Playfair Display", "EB Garamond", serif',
      fontWeight: 700,
      fontSize: '4rem',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Playfair Display", "EB Garamond", serif',
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: '"Playfair Display", "EB Garamond", serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      fontFamily: '"Playfair Display", "EB Garamond", serif',
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    body1: {
      fontFamily: '"Inter", "PP Telegraf", system-ui, sans-serif',
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: '"Inter", "PP Telegraf", system-ui, sans-serif',
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontFamily: '"Inter", "PP Telegraf", system-ui, sans-serif',
      fontWeight: 600,
      fontSize: '0.75rem',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    caption: {
      fontFamily: '"Inter", "PP Telegraf", system-ui, sans-serif',
      fontWeight: 500,
      fontSize: '0.75rem',
      letterSpacing: '0.1em',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollBehavior: 'smooth',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '14px 32px',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        containedPrimary: {
          backgroundColor: '#003527',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#0b513d',
          },
        },
        containedSecondary: {
          backgroundColor: '#d4af37',
          color: '#003527',
          '&:hover': {
            backgroundColor: '#e9c349',
          },
        },
        outlined: {
          borderColor: '#d4af37',
          color: '#d4af37',
          '&:hover': {
            backgroundColor: 'rgba(212, 175, 55, 0.08)',
            borderColor: '#e9c349',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          boxShadow: 'none',
          border: '1px solid #e0e3e5',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            boxShadow: '0 20px 40px rgba(30, 41, 59, 0.04)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 600,
          fontSize: '0.65rem',
          letterSpacing: '0.08em',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
  },
});
