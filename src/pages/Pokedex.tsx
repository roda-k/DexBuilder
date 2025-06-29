import { 
  Box, 
  Container, 
  Typography, 
  useTheme, 
  useMediaQuery, 
  Paper
} from '@mui/material';
import Grid from '@mui/material/Grid';
import TopNavbar from '../components/TopNavbar';
import ModelGallery from '../components/ModelGallery';

const Pokedex = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      // Ensure content order is preserved
      '& > *': { 
        order: 'initial' 
      }
    }}>
      {/* Fixed TopNavbar */}
      <Box sx={{ 
        order: 1, // Explicitly set first
        width: '100%',
        zIndex: theme.zIndex.appBar
      }}>
        <TopNavbar />
      </Box>
      
      {/* Main content area with landing message first */}
      <Box 
        component="main"
        sx={{
          order: 2, // Explicitly set second
          flexGrow: 1,
          width: '100%',
          backgroundColor: theme.palette.background.default,
          pt: 2,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Landing message - ensure this stays at top */}
          <Box sx={{ mb: 4, order: 1 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid size={{xs:12, md:6}}>
                <Box sx={{ p: 2 }}>
                  <Typography 
                    variant="h2" 
                    component="h1" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: isSmallScreen ? '2.5rem' : '3.5rem',
                      color: theme.palette.primary.main // Add red accent to heading
                    }}
                  >
                    Pokémon 3D Gallery
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ mb: 4 }}
                  >
                    Explore our collection of 3D Pokémon models
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Model Gallery - comes after landing message */}
          <Box sx={{ order: 2, mb: 6 }}>
            <ModelGallery />
          </Box>

          {/* Feature cards - come last */}
          <Box sx={{ order: 3 }}>
            <Grid container spacing={3} sx={{ mt: 4 }}>
              {[
                { title: "Extensive Database", description: "Access comprehensive information about all Pokémon species." },
                { title: "Build Teams", description: "Create and analyze your perfect Pokémon team." },
                { title: "Track Collections", description: "Keep track of your Pokémon collection progress." }
              ].map((feature, index) => (
                <Grid size={{xs:12, md:4}} key={index}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 3, 
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'translateY(-5px)',
                      },
                      bgcolor: 'background.paper',
                      borderLeft: index === 0 ? `4px solid ${theme.palette.primary.main}` : 'none'
                    }}
                  >
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1">
                      {feature.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Pokedex;