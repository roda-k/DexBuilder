import { createTheme } from '@mui/material/styles';

const accentRed = {
  main: '#ff3d4d',
  light: '#ff7071',
  dark: '#b50016',
  contrastText: '#ffffff'
};

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: accentRed,
    secondary: {
      main: '#ff6b6b',
      dark: '#c73a3a',
      light: '#ff9c9c',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    error: {
      main: '#ff5252',
    },
    warning: {
      main: '#ffbc34',
    },
    info: {
      main: '#448aff',
    },
    success: {
      main: '#47cc76',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          borderRadius: 8,
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#ff3d4d',
          '&:hover': {
            backgroundColor: 'rgba(255, 61, 77, 0.08)',
          }
        }
      }
    },
  },
});

export default darkTheme;