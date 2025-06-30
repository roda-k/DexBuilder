import { Routes, Route, Navigate } from 'react-router';
import Pokedex from '../pages/Pokedex';
import PokemonDetail from '../pages/PokemonDetail';

const AppRouter = () => {
  return(
    <Routes>
      <Route path="/" element={<Navigate to="/Pokedex" replace />} />
      <Route path="/Pokedex" element={<Pokedex />} />
      <Route path="/Pokedex/:pokemonName" element={<PokemonDetail />} />
    </Routes>
  );
}

export default AppRouter
