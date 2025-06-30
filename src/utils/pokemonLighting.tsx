export interface TypeLighting {
  mainLight: string;
  intensity: number;
  ambientColor: string;
  ambientIntensity: number;
  // Add these new properties
  backgroundColor: string;
  secondaryColor: string; // For gradient effects
}

export const typeLighting: Record<string, TypeLighting> = {
  normal: {
    mainLight: '#a8a878',
    intensity: 1.0,
    ambientColor: '#d9d9d9',
    ambientIntensity: 0.3,
    backgroundColor: '#A8A878',
    secondaryColor: '#C6C6A7'
  },
  fire: {
    mainLight: '#ff9248',
    intensity: 1.3,
    ambientColor: '#3a1f00',
    ambientIntensity: 0.4,
    backgroundColor: '#F08030',
    secondaryColor: '#FD7D24'
  },
  water: {
    mainLight: '#90e0ef', 
    intensity: 0.9,
    ambientColor: '#0077b6',
    ambientIntensity: 0.3,
    backgroundColor: '#6890F0',
    secondaryColor: '#5CC1E3'
  },
  electric: {
    mainLight: '#ffee32',
    intensity: 1.2,
    ambientColor: '#fcbf49',
    ambientIntensity: 0.5,
    backgroundColor: '#F8D030',
    secondaryColor: '#FAE078'
  },
  grass: {
    mainLight: '#80b918',
    intensity: 1.0,
    ambientColor: '#1b4332',
    ambientIntensity: 0.35,
    backgroundColor: '#78C850',
    secondaryColor: '#A7DB8D'
  },
  ice: {
    mainLight: '#caf0f8',
    intensity: 0.8,
    ambientColor: '#a8dadc',
    ambientIntensity: 0.4,
    backgroundColor: '#98D8D8',
    secondaryColor: '#BCE6E6'
  },
  fighting: {
    mainLight: '#e76f51',
    intensity: 1.1,
    ambientColor: '#bc6c25',
    ambientIntensity: 0.35,
    backgroundColor: '#C03028',
    secondaryColor: '#D67873'
  },
  poison: {
    mainLight: '#c77dff',
    intensity: 0.9,
    ambientColor: '#7b2cbf',
    ambientIntensity: 0.4,
    backgroundColor: '#A040A0',
    secondaryColor: '#C183C1'
  },
  ground: {
    mainLight: '#ddbea9',
    intensity: 1.05,
    ambientColor: '#6b705c',
    ambientIntensity: 0.3,
    backgroundColor: '#E0C068',
    secondaryColor: '#EBD69D'
  },
  flying: {
    mainLight: '#ade8f4',
    intensity: 1.0,
    ambientColor: '#90e0ef',
    ambientIntensity: 0.4,
    backgroundColor: '#A890F0',
    secondaryColor: '#C6B7F5'
  },
  psychic: {
    mainLight: '#ff70a6',
    intensity: 1.0,
    ambientColor: '#ff9770',
    ambientIntensity: 0.3,
    backgroundColor: '#F85888',
    secondaryColor: '#FA92B2'
  },
  bug: {
    mainLight: '#d8f3dc',
    intensity: 1.0,
    ambientColor: '#606c38',
    ambientIntensity: 0.35,
    backgroundColor: '#A8B820',
    secondaryColor: '#C6D16E'
  },
  rock: {
    mainLight: '#ced4da',
    intensity: 1.1,
    ambientColor: '#6c584c',
    ambientIntensity: 0.25,
    backgroundColor: '#B8A038',
    secondaryColor: '#D1C17D'
  },
  ghost: {
    mainLight: '#7400b8',
    intensity: 0.7,
    ambientColor: '#5e60ce',
    ambientIntensity: 0.3,
    backgroundColor: '#705898',
    secondaryColor: '#A292BC'
  },
  dragon: {
    mainLight: '#5e60ce',
    intensity: 1.1,
    ambientColor: '#240046',
    ambientIntensity: 0.3,
    backgroundColor: '#7038F8',
    secondaryColor: '#8C6FF1'
  },
  dark: {
    mainLight: '#343a40',
    intensity: 0.7,
    ambientColor: '#212529',
    ambientIntensity: 0.2,
    backgroundColor: '#705848',
    secondaryColor: '#A29288'
  },
  steel: {
    mainLight: '#dee2e6',
    intensity: 1.2,
    ambientColor: '#6c757d',
    ambientIntensity: 0.3,
    backgroundColor: '#B8B8D0',
    secondaryColor: '#D1D1E0'
  },
  fairy: {
    mainLight: '#ffc8dd',
    intensity: 0.9,
    ambientColor: '#ffafcc',
    ambientIntensity: 0.4,
    backgroundColor: '#EE99AC',
    secondaryColor: '#F4BDC9'
  }
};

/**
 * Gets lighting configuration for a Pokémon based on its type(s)
 * @param types Array of Pokémon types (primary first, secondary second)
 * @param blendTypes Whether to blend dual types (default: false)
 * @returns Lighting configuration
 */
export const getPokemonLighting = (types: string[], blendTypes: boolean = false): TypeLighting => {
  if (!types || types.length === 0) return typeLighting.normal;
  
  // If only one type or not blending, return the primary type lighting
  if (types.length === 1 || !blendTypes) {
    return typeLighting[types[0].toLowerCase()] || typeLighting.normal;
  }
  
  // Blend both types' lighting (70% primary, 30% secondary)
  const primaryLighting = typeLighting[types[0].toLowerCase()] || typeLighting.normal;
  const secondaryLighting = typeLighting[types[1].toLowerCase()] || typeLighting.normal;
  
  // Helper function to blend colors
  const blendColors = (color1: string, color2: string, ratio: number = 0.7) => {
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const fullHex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };
    
    // Convert RGB to hex
    const rgbToHex = (r: number, g: number, b: number) => {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };
    
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    const blendedR = Math.round((rgb1.r * ratio) + (rgb2.r * (1 - ratio)));
    const blendedG = Math.round((rgb1.g * ratio) + (rgb2.g * (1 - ratio)));
    const blendedB = Math.round((rgb1.b * ratio) + (rgb2.b * (1 - ratio)));
    
    return rgbToHex(blendedR, blendedG, blendedB);
  };
  
  return {
    mainLight: blendColors(primaryLighting.mainLight, secondaryLighting.mainLight),
    intensity: (primaryLighting.intensity * 0.7) + (secondaryLighting.intensity * 0.3),
    ambientColor: blendColors(primaryLighting.ambientColor, secondaryLighting.ambientColor),
    ambientIntensity: (primaryLighting.ambientIntensity * 0.7) + (secondaryLighting.ambientIntensity * 0.3),
    // Add these two properties:
    backgroundColor: blendColors(primaryLighting.backgroundColor, secondaryLighting.backgroundColor),
    secondaryColor: blendColors(primaryLighting.secondaryColor, secondaryLighting.secondaryColor)
  };
};

// Add a function to generate CSS background based on type(s)
export const getTypeBackground = (types: string[]): string => {
  if (!types || types.length === 0) {
    return `linear-gradient(135deg, ${typeLighting.normal.backgroundColor}, ${typeLighting.normal.secondaryColor})`;
  }
  
  // Single type - create a gradient with its two colors
  if (types.length === 1) {
    // Safely get the type with case insensitivity
    const typeKey = types[0].toLowerCase();
    
    // Check if this type exists in our lighting object
    const typeExists = Object.keys(typeLighting).some(key => key.toLowerCase() === typeKey);
    if (!typeExists) {
      return `linear-gradient(135deg, ${typeLighting.normal.backgroundColor}, ${typeLighting.normal.secondaryColor})`;
    }
    
    // Find the correct key with case insensitivity
    const actualKey = Object.keys(typeLighting).find(key => key.toLowerCase() === typeKey) || 'normal';
    const colors = typeLighting[actualKey];
    
    return `linear-gradient(135deg, ${colors.backgroundColor}, ${colors.secondaryColor})`;
  }
  
  // Dual type - blend the primary and secondary types
  const primaryTypeKey = types[0].toLowerCase();
  const secondaryTypeKey = types[1].toLowerCase();
  
  
  // Find the actual keys with case insensitivity
  const primaryKey = Object.keys(typeLighting).find(key => 
    key.toLowerCase() === primaryTypeKey) || 'normal';
  const secondaryKey = Object.keys(typeLighting).find(key => 
    key.toLowerCase() === secondaryTypeKey) || 'normal';
  
  const primary = typeLighting[primaryKey];
  const secondary = typeLighting[secondaryKey];
  
  // Create a diagonal gradient that shows both types
  return `linear-gradient(135deg, 
    ${primary.backgroundColor} 0%, 
    ${primary.secondaryColor} 45%, 
    ${secondary.backgroundColor} 55%, 
    ${secondary.secondaryColor} 100%)`;
};

// Add a function to generate softer backgrounds that don't overpower the models
export const getSofterTypeBackground = (types: string[]): string => {
  if (!types || types.length === 0) {
    return `linear-gradient(135deg, ${lightenColor(typeLighting.normal.backgroundColor, 0.3)}, ${lightenColor(typeLighting.normal.secondaryColor, 0.4)})`;
  }
  
  // Single type - create a softer gradient with its two colors
  if (types.length === 1) {
    // Safely get the type with case insensitivity
    const typeKey = types[0].toLowerCase();
    
    // Find the correct key with case insensitivity
    const actualKey = Object.keys(typeLighting).find(key => key.toLowerCase() === typeKey) || 'normal';
    const colors = typeLighting[actualKey];
    
    // Create a softer gradient with more lightness
    return `linear-gradient(135deg, 
      ${lightenColor(colors.backgroundColor, 0.3)}, 
      ${lightenColor(colors.secondaryColor, 0.4)})`;
  }
  
  // Dual type - create a softer blend for both types
  const primaryTypeKey = types[0].toLowerCase();
  const secondaryTypeKey = types[1].toLowerCase();
  
  // Find the actual keys with case insensitivity
  const primaryKey = Object.keys(typeLighting).find(key => 
    key.toLowerCase() === primaryTypeKey) || 'normal';
  const secondaryKey = Object.keys(typeLighting).find(key => 
    key.toLowerCase() === secondaryTypeKey) || 'normal';
  
  const primary = typeLighting[primaryKey];
  const secondary = typeLighting[secondaryKey];
  
  // Create a gentler gradient that won't compete with the model
  return `linear-gradient(135deg, 
    ${lightenColor(primary.backgroundColor, 0.25)} 0%, 
    ${lightenColor(primary.secondaryColor, 0.4)} 45%, 
    ${lightenColor(secondary.backgroundColor, 0.25)} 55%, 
    ${lightenColor(secondary.secondaryColor, 0.4)} 100%)`;
};

// Helper function to lighten a color for backgrounds
function lightenColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  
  // Convert hex to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Lighten
  r = Math.min(255, Math.round(r + (255 - r) * amount));
  g = Math.min(255, Math.round(g + (255 - g) * amount));
  b = Math.min(255, Math.round(b + (255 - b) * amount));
  
  // Convert back to hex
  return `#${(r.toString(16).padStart(2, '0'))}${(g.toString(16).padStart(2, '0'))}${(b.toString(16).padStart(2, '0'))}`;
}