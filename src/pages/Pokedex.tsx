import { 
  Box, 
  Container, 
  Typography, 
  useTheme,
  Divider
} from '@mui/material';
import TopNavbar from '../components/TopNavbar';
import ModelGallery from '../components/ModelGallery';

const Pokedex = () => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
      position: 'relative',
    }}>
      <TopNavbar />
      
      <Container 
        maxWidth="lg" 
        sx={{ 
          pt: 2, 
          flexGrow: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2
          }}
        >
          <Typography 
            variant="h5" 
            component="h1"
            sx={{ 
              fontWeight: 600,
              color: theme.palette.primary.main,
            }}
          >
            Pokédex
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ opacity: 0.8 }}
          >
            Explore 3D models
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3, opacity: 0.6 }} />
        
        <Box 
          sx={{ 
            position: 'relative',
            flexGrow: 1, 
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 180px)', 
            marginLeft: -3,
            marginRight: -3,
            paddingLeft: 3,
            paddingRight: 3,
          }}
        >
          <ModelGallery style={{ height: '100%' }} />
        </Box>
      </Container>
      
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '150px',
          pointerEvents: 'none',
          zIndex: 100,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: `linear-gradient(to bottom, 
              rgba(0,0,0,0) 0%, 
              rgba(0,0,0,0.05) 20%,
              rgba(0,0,0,0.1) 40%)`,
            maskImage: 'linear-gradient(to bottom, transparent, black)',
            boxShadow: theme.palette.mode === 'dark' 
              ? 'inset 0 -40px 60px rgba(0,0,0,0.3)' 
              : 'inset 0 -40px 60px rgba(20,20,20,0.15)',
            zIndex: 1,
          }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '120px',
            backdropFilter: 'blur(8px)',
            background: 'transparent',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
            zIndex: 2,
          }}
        />
      </Box>
    </Box>
  );
};

export default Pokedex;