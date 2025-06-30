import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router'; // Correct import
import { 
  Box, Container, Typography, Button, Grid, Paper, 
  CircularProgress, Chip, Divider, Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ModelViewer from '../components/ModelViewer';
import TypeIcon from '../components/ui/TypeIcon';
import { 
  capitalizePokemonName, 
  formatPokemonNumber, 
  getStatColor,
  formatStatName
} from '../utils/pokemonUtils';
import { fetchPokemonDetails } from '../services/pokemonDataService';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; // A sparkle icon

const PokemonDetail = () => {
  const { pokemonName } = useParams<{ pokemonName: string }>();
  const [pokemonData, setPokemonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadPokemonData = async () => {
      if (!pokemonName) return;
      
      try {
        setLoading(true);
        const data = await fetchPokemonDetails(pokemonName);
        setPokemonData(data);
      } catch (err) {
        console.error("Failed to load Pokémon details:", err);
        setError("Failed to load Pokémon details");
      } finally {
        setLoading(false);
      }
    };
    
    loadPokemonData();
  }, [pokemonName]);
  
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '70vh' 
      }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }
  
  if (error || !pokemonData) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="error">{error || "Pokémon not found"}</Typography>
          <Button 
            component={Link} 
            to="/Pokedex" 
            startIcon={<ArrowBackIcon />}
            sx={{ mt: 2 }}
          >
            Back to Gallery
          </Button>
        </Box>
      </Container>
    );
  }
  
  // Calculate Pokemon ID and model path
  const paddedId = String(pokemonData.id).padStart(4, '0');
  // Use window.location.origin to construct absolute URL
  const modelPath = `${window.location.origin}/glbs/${paddedId}.glb`;
  
  // Get Pokemon description
  const englishFlavorText = pokemonData.speciesData?.flavor_text_entries?.find(
    (entry: any) => entry.language.name === 'en'
  )?.flavor_text?.replace(/\f/g, ' ').replace(/\n/g, ' ') || "No description available";
  
  // Get all Pokémon types
  const pokemonTypes = pokemonData.types.map((typeInfo: any) => typeInfo.type.name);
  console.log("Pokémon types extracted:", pokemonTypes);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back button */}
      <Button 
        component={Link} 
        to="/Pokedex" 
        startIcon={<ArrowBackIcon />}
        sx={{ 
          mb: 4,
          color: 'primary.main',
          '&:hover': {
            bgcolor: 'rgba(255, 61, 77, 0.1)',
          }
        }}
      >
        Back to Gallery
      </Button>
      
      <Grid container spacing={4}>
        {/* Left column - 3D Model & Description */}
        <Grid size={{xs:12, md:5}}> {/* Correct Grid syntax */}
          <Paper 
            elevation={3}
            sx={{ 
              borderRadius: 2, 
              overflow: 'hidden',
              bgcolor: 'background.paper',
              height: 400,
              mb: 3
            }}
          >
            <ModelViewer
              modelPath={modelPath}
              height="100%"
              autoRotate={true}
              scale={1.2}
              pokemonType={pokemonTypes} // Ensure this has the correct types
            />
          </Paper>
          
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              About
            </Typography>
            <Typography variant="body2" paragraph>
              {englishFlavorText}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Right column - Pokemon Details */}
        <Grid size={{xs:12, md:7}}> {/* Correct Grid syntax */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                color: 'primary.main'
              }}
            >
              {capitalizePokemonName(pokemonName || '')}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {formatPokemonNumber(paddedId)}
            </Typography>
            
            {/* Types */}
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              {pokemonData.types.map((typeInfo: any) => (
                <TypeIcon 
                  key={typeInfo.type.name} 
                  type={typeInfo.type.name}
                  size={48}
                  brightnessFactor={1.1}
                />
              ))}
            </Box>
          </Box>
          
          {/* Stats */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Base Stats
            </Typography>
            
            {pokemonData.stats.map((stat: any) => (
              <Box key={stat.stat.name} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {formatStatName(stat.stat.name)}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stat.base_stat}
                  </Typography>
                </Box>
                <Box sx={{ 
                  height: 10, 
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2, 
                  overflow: 'hidden' 
                }}>
                  <Box 
                    sx={{ 
                      height: '100%', 
                      width: `${Math.min((stat.base_stat / 255) * 100, 100)}%`,
                      bgcolor: getStatColor(stat.stat.name),
                      borderRadius: 2
                    }} 
                  />
                </Box>
              </Box>
            ))}
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Total</Typography>
              <Typography variant="body2" fontWeight="bold">
                {pokemonData.stats.reduce((sum: number, stat: any) => sum + stat.base_stat, 0)}
              </Typography>
            </Box>
          </Paper>
          
          {/* Additional Details */}
          <Grid container spacing={3}>
            <Grid size={{xs:12, md:6}}> {/* Correct Grid syntax */}
              <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Physical Details
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid size={{xs:6}}> {/* Correct Grid syntax */}
                    <Typography color="text.secondary" variant="body2">
                      Height
                    </Typography>
                    <Typography fontWeight="medium">
                      {(pokemonData.height / 10).toFixed(1)}m
                    </Typography>
                  </Grid>
                  
                  <Grid size={{xs:6}}> {/* Correct Grid syntax */}
                    <Typography color="text.secondary" variant="body2">
                      Weight
                    </Typography>
                    <Typography fontWeight="medium">
                      {(pokemonData.weight / 10).toFixed(1)}kg
                    </Typography>
                  </Grid>
                  
                  <Grid size={{xs:12}} sx={{ mt: 1 }}> {/* Correct Grid syntax */}
                    <Typography color="text.secondary" variant="body2">
                      Abilities
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                      {pokemonData.abilities.map((ability: any) => (
                        <Tooltip 
                          key={ability.ability.name}
                          title={ability.is_hidden ? "Hidden ability" : "Standard ability"}
                          arrow
                          placement="top"
                        >
                          <Chip 
                            icon={ability.is_hidden ? 
                              <AutoAwesomeIcon sx={{ 
                                fontSize: '0.9rem', 
                                color: 'primary.main',
                                animation: ability.is_hidden ? 'sparkle 1.5s infinite' : 'none',
                              }} /> : 
                              undefined
                            }
                            label={ability.ability.name.replace('-', ' ')}
                            size="small"
                            sx={{ 
                              textTransform: 'capitalize',
                              padding: 0.5,
                              ...(ability.is_hidden && {
                                bgcolor: 'rgba(255, 61, 77, 0.15)',
                                color: 'primary.main',
                                fontWeight: 'medium',
                                border: '1px solid rgba(255, 61, 77, 0.3)',
                                position: 'relative',
                                transition: 'all 0.3s ease',
                                
                                // Hover animations
                                '@keyframes pulse': {
                                  '0%': { boxShadow: '0 0 0 0 rgba(255, 61, 77, 0.7)' },
                                  '70%': { boxShadow: '0 0 0 6px rgba(255, 61, 77, 0)' },
                                  '100%': { boxShadow: '0 0 0 0 rgba(255, 61, 77, 0)' }
                                },
                                
                                '@keyframes sparkle': {
                                  '0%': { opacity: 1 },
                                  '50%': { opacity: 0.6 },
                                  '100%': { opacity: 1 }
                                },
                                
                                '&:hover': {
                                  transform: 'translateY(-2px) scale(1.05)',
                                  animation: 'pulse 1.5s infinite',
                                  bgcolor: 'rgba(255, 61, 77, 0.25)',
                                  borderColor: 'rgba(255, 61, 77, 0.5)',
                                }
                              })
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid size={{xs:12, md:6}}> {/* Correct Grid syntax */}
              <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Training
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid size={{xs:6}}> {/* Correct Grid syntax */}
                    <Typography color="text.secondary" variant="body2">
                      Base Exp
                    </Typography>
                    <Typography fontWeight="medium">
                      {pokemonData.base_experience || "N/A"}
                    </Typography>
                  </Grid>
                  
                  <Grid size={{xs:6}}> {/* Correct Grid syntax */}
                    <Typography color="text.secondary" variant="body2">
                      Growth Rate
                    </Typography>
                    <Typography fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                      {pokemonData.speciesData?.growth_rate?.name?.replace('-', ' ') || "N/A"}
                    </Typography>
                  </Grid>
                  
                  <Grid size={{xs:12}} sx={{ mt: 1 }}> {/* Correct Grid syntax */}
                    <Typography color="text.secondary" variant="body2">
                      Egg Groups
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                      {pokemonData.speciesData?.egg_groups?.map((group: any) => (
                        <Chip 
                          key={group.name}
                          label={group.name.replace('-', ' ')}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PokemonDetail;