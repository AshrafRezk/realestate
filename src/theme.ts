import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  direction: 'ltr',
  palette: {
    primary: {
      main: '#0a1628',
      light: '#bbc7df',
      dark: '#030f1e',
      contrastText: '#d7e3f9',
    },
    secondary: {
      main: '#e6c364',
      light: '#ffe08f',
      dark: '#785d00',
      contrastText: '#3d2e00',
    },
    background: {
      default: '#071423',
      paper: '#2a3546',
    },
    text: {
      primary: '#d7e3f9',
      secondary: '#c5c6cd',
    },
    success: {
      main: '#2b6954',
      light: '#b0f0d6',
    },
    warning: {
      main: '#e6c364',
      light: '#ffe08f',
    },
    error: {
      main: '#ffb4ab',
      light: '#ffdad6',
    },
    divider: '#45474c',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    h1: {
      fontFamily: '"Hanken Grotesk", sans-serif',
      fontWeight: 700,
      fontSize: '4rem',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Hanken Grotesk", sans-serif',
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: '"Hanken Grotesk", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      fontFamily: '"Hanken Grotesk", sans-serif',
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    body1: {
      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontFamily: '"Hanken Grotesk", sans-serif',
      fontWeight: 600,
      fontSize: '0.75rem',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    caption: {
      fontFamily: '"Hanken Grotesk", sans-serif',
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
          backgroundColor: '#e6c364',
          color: '#3d2e00',
          '&:hover': {
            backgroundColor: '#ffe08f',
          },
        },
        containedSecondary: {
          backgroundColor: '#0a1628',
          color: '#d7e3f9',
          '&:hover': {
            backgroundColor: '#1f2b3b',
          },
        },
        outlined: {
          borderColor: '#e6c364',
          color: '#e6c364',
          '&:hover': {
            backgroundColor: 'rgba(230, 195, 100, 0.08)',
            borderColor: '#ffe08f',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          boxShadow: 'none',
          border: '1px solid rgba(230,195,100,0.1)',
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
