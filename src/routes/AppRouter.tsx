import { Routes, Route, Navigate } from 'react-router';
import Pokedex from '../pages/Pokedex';

const AppRouter = () => {
  return(
    <Routes>
      <Route path="/" element={<Navigate to="/Pokedex" replace />} />
      <Route path="/Pokedex" element={<Pokedex />} />
    </Routes>
  );
}

export default AppRouter
