import { createTheme } from '@mui/material/styles';

// Define red accent colors
const accentRed = {
  main: '#ff3d4d',       // Bright red as main accent
  light: '#ff7071',      // Lighter shade for hover states
  dark: '#b50016',       // Darker red for pressed states
  contrastText: '#ffffff' // White text on red backgrounds
};

// Create the dark theme
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
      default: '#121212', // Very dark gray, almost black
      paper: '#1e1e1e',   // Slightly lighter for cards/papers
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
          backgroundColor: '#1e1e1e', // Dark card background
          borderRadius: 8,
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e', // Dark paper background
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#ff3d4d', // Red icon buttons
          '&:hover': {
            backgroundColor: 'rgba(255, 61, 77, 0.08)', // Subtle red hover effect
          }
        }
      }
    },
  },
});

export default darkTheme;