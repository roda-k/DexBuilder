import { Pokedex } from 'pokeapi-js-wrapper';

// Create a singleton instance of Pokedex with caching
export const pokedexInstance = new Pokedex({ cache: true });

// Create a simple cache for Pokemon details
const pokemonCache: Record<string, any> = {};

export const fetchPokemonDetails = async (pokemonName: string) => {
  const lowerName = pokemonName.toLowerCase();
  
  // Return from cache if available
  if (pokemonCache[lowerName]) {
    return pokemonCache[lowerName];
  }
  
  try {
    // Get basic Pokemon data
    const data = await pokedexInstance.getPokemonByName(lowerName);
    
    // Get species data
    const species = await pokedexInstance.resource(data.species.url);
    
    // Combine and cache the data
    const combinedData = {
      ...data,
      speciesData: species
    };
    
    // Store in cache
    pokemonCache[lowerName] = combinedData;
    
    return combinedData;
  } catch (error) {
    console.error(`Failed to fetch details for ${pokemonName}:`, error);
    throw error;
  }
};