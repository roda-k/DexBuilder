import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter } from 'react-router';
import darkTheme from './theme/darkTheme';
import Pokedex from './pages/Pokedex';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Pokedex />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;