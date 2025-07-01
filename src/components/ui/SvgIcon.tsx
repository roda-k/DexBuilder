import { Box, SxProps, Theme } from '@mui/material';

interface SvgIconProps {
  src: string;
  sx?: SxProps<Theme>;
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
        ...(sx || {})
      }}
    />
  );
};

export default SvgIcon;