import { Box, SxProps, Theme } from '@mui/material';

interface SvgIconProps {
  src: string;
  sx?: SxProps<Theme>; // Add support for sx prop
}

const SvgIcon = ({ src, sx }: SvgIconProps) => {
  return (
    <Box 
      component="img" 
      src={src} 
      alt="icon"
      sx={{
        width: '1em',
        height: '1em',
        display: 'inline-block',
        // Spread any additional sx props
        ...(sx || {})
      }}
    />
  );
};

export default SvgIcon;