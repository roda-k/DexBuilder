export const formatPokemonNumber = (id: string): string => {
  return `Dex n°${parseInt(id, 10)}`;
};

export const formatStatName = (statName: string): string => {
  const statNameMap: {[key: string]: string} = {
    'hp': 'HP',
    'attack': 'Attack',
    'defense': 'Defense',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    'speed': 'Speed'
  };
  
  return statNameMap[statName] || statName;
};

export const getStatColor = (statName: string): string => {
  const statColors: {[key: string]: string} = {
    'hp': '#FF5959',           // Slightly brightened
    'attack': '#FF9839',       // More orange-red
    'defense': '#FFDC53',      // Brighter yellow
    'special-attack': '#7DB9FF', // Brighter blue
    'special-defense': '#9BEA79', // Brighter green
    'speed': '#FF73A0'         // Brighter pink
  };
  
  return statColors[statName] || '#FF5959'; // Default to HP color
};

export const capitalizePokemonName = (name: string): string => {
  if (!name) return '';
  
  const parts = name.split(/[ -]/);
  
  const capitalized = parts.map(part => 
    part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
  );
  
  return name.includes('-') ? capitalized.join('-') : capitalized.join(' ');
};

export type VariantMap = {
  [pokemonId: string]: string[];
};

export const POKEMON_WITH_VARIANTS: VariantMap = {
  "0916": ["M", "F"],
  "0521": ["M", "F"],
  "0668": ["M", "F"],
};