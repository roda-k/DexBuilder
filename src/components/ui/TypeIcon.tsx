import { Box } from '@mui/material';

interface TypeIconProps {
  type: string;
  size?: number;
  brightnessFactor?: number;
}

const TYPE_COLORS: Record<string, string> = {
  bug: '#92BC2C',
  dark: '#595761',
  dragon: '#0C69C8',
  electric: '#F2D94E',
  fairy: '#EE90E6',
  fighting: '#D3425F',
  fire: '#FBA54C',
  flying: '#A1BBEC',
  ghost: '#5F6DBC',
  grass: '#5FBD58',
  ground: '#DA7C4D',
  ice: '#75D0C1',
  normal: '#A0A29F',
  poison: '#B763CF',
  psychic: '#FA8581',
  rock: '#C9BB8A',
  steel: '#5695A3',
  water: '#539DDF',
};

const TypeIcon = ({ type, size = 36, brightnessFactor = 1 }: TypeIconProps) => {
  const normalizedType = type.toLowerCase();
  const backgroundColor = TYPE_COLORS[normalizedType] || '#A0A29F';
  
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        p: 0.5,
        filter: `brightness(${brightnessFactor})`,
      }}
    >
      <img 
        src={`/icons/${normalizedType}.svg`}
        alt={`${type} type`}
        style={{
          width: '70%',
          height: '70%',
          objectFit: 'contain',
          filter: 'brightness(0) invert(1)',
        }}
      />
    </Box>
  );
};

export { TYPE_COLORS };
export default TypeIcon;