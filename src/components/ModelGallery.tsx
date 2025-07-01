import { useState, useRef, useEffect } from 'react';
import { Typography, Box, Paper, Card, CardContent, CardHeader, IconButton, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Grid from '@mui/material/Grid';
import { Virtuoso } from 'react-virtuoso';
import { LazyModelViewer } from './ModelViewer';
import { Pokedex } from 'pokeapi-js-wrapper';
import TypeIcon from './ui/TypeIcon';
import {
  formatPokemonNumber,
  formatStatName,
  getStatColor,
  POKEMON_WITH_VARIANTS,
  capitalizePokemonName,
} from '../utils/pokemonUtils';
import { useNavigate } from 'react-router';
import SearchBar from './SearchBar';

interface PokemonModel {
  id: string;
  name: string;
  modelPath: string;
  variant?: string;
  apiData?: any; //  api data for use in UI, need refining
}

const ModelGallery = ({ style = {} }) => {
  const navigate = useNavigate();

  const [models, setModels] = useState<PokemonModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skippedModels, setSkippedModels] = useState<string[]>([]);
  const [expandedStats, setExpandedStats] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredModels, setFilteredModels] = useState<PokemonModel[]>([]);

  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // This tracks active models to limit concurrent rendering
  const [activeModelLimit] = useState(8); // adjust based on device
  const [visibleModelIndexes, setVisibleModelIndexes] = useState<number[]>([]);

  // toggle stats expansion for specific Pokemon
  const toggleStats = (id: string) => {
    setExpandedStats(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    const loadPokemonData = async () => {
      try {
        const P = new Pokedex({ cache: true });

        const response = await P.getPokemonsList({ offset: 0, limit: 151 });

        const modelPromises = response.results.map(async (pokemon: any) => {
          const details = await P.getPokemonByName(pokemon.name);
          const pokemonId = String(details.id).padStart(4, '0');

          // check variants
          if (POKEMON_WITH_VARIANTS[pokemonId]) {
            return POKEMON_WITH_VARIANTS[pokemonId].map(variant => ({
              id: `${pokemonId}-${variant}`,
              name: `${pokemon.name} (${variant === 'M' ? 'Male' : 'Female'})`,
              // modelPath: `/glbs/${pokemonId}-${variant}.glb`, local path
              modelPath: `${import.meta.env.BASE_URL}glbs/${pokemonId}-${variant}.glb`, //deployment base url
              variant,
              apiData: details
            }));
          }

          return [{
            id: pokemonId,
            name: pokemon.name,
            // modelPath: `/glbs/${pokemonId}.glb`, same here
            modelPath: `${import.meta.env.BASE_URL}glbs/${pokemonId}.glb`,
            apiData: details
          }];
        });

        // Flatten the array of arrays into a single flat array of models
        const modelArrays = await Promise.all(modelPromises);
        const modelList = modelArrays.flat();

        setModels(modelList);
        // console.log("Loaded Pokémon models:", models.length); commented debug purposes, also need handler for errors here
      } catch (err) {
        console.error("Failed to load Pokémon data:", err);
        setError("Failed to load Pokémon data");
      } finally {
        setLoading(false);
      }
    };

    loadPokemonData();
  }, []);

  // custom scrollbar styles
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      /* Target all scrollbars in the Virtuoso component */
      .virtuoso-scroller::-webkit-scrollbar,
      .virtuoso-item-list::-webkit-scrollbar,
      [data-virtuoso-scroller]::-webkit-scrollbar {
        width: 8px !important;
        height: 8px !important;
      }
      
      .virtuoso-scroller::-webkit-scrollbar-track,
      .virtuoso-item-list::-webkit-scrollbar-track,
      [data-virtuoso-scroller]::-webkit-scrollbar-track {
        background: rgba(30, 30, 30, 0.8) !important;
        border-radius: 4px !important;
      }
      
      .virtuoso-scroller::-webkit-scrollbar-thumb,
      .virtuoso-item-list::-webkit-scrollbar-thumb,
      [data-virtuoso-scroller]::-webkit-scrollbar-thumb {
        background-color: rgba(255, 61, 77, 0.7) !important;
        border-radius: 4px !important;
      }
      
      .virtuoso-scroller::-webkit-scrollbar-thumb:hover,
      .virtuoso-item-list::-webkit-scrollbar-thumb:hover,
      [data-virtuoso-scroller]::-webkit-scrollbar-thumb:hover {
        background-color: rgba(255, 61, 77, 0.9) !important;
      }
      
      /* Firefox scrollbar styling */
      .virtuoso-scroller,
      .virtuoso-item-list,
      [data-virtuoso-scroller] {
        scrollbar-width: thin !important;
        scrollbar-color: rgba(255, 61, 77, 0.7) rgba(30, 30, 30, 0.8) !important;
      }
    `;

    // add to document head
    document.head.appendChild(styleEl);

    // Clean up
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  const handlePokemonClick = (name: string) => {
    navigate(`/Pokedex/${name}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredModels(models);
      return;
    }
    
    let filteredResults = [...models];
    let typeFilters: string[] = [];
    let textQuery = query;
    
    if (query.includes('exacttype:')) {
      const typeMatch = query.match(/exacttype:([^,]*)(,([^,]*))?/);
      if (typeMatch) {
        typeFilters = typeMatch[1] ? [typeMatch[1]] : [];
        if (typeMatch[3]) typeFilters.push(typeMatch[3]);
        
        // remove the type filter part from the query for text searching
        textQuery = query.replace(/exacttype:[^,]*(,[^,]*)?/, '').trim();
        
        filteredResults = filteredResults.filter(model => {
          const modelTypes = model.apiData?.types.map((t: any) => t.type.name.toLowerCase());
          
          // single type filter, show any Pokémon that has this type
          if (typeFilters.length === 1) {
            return modelTypes && modelTypes.includes(typeFilters[0].toLowerCase());
          }
          // two type filters, the model must have exactly those two types
          else if (typeFilters.length === 2) {
            return modelTypes && 
                   modelTypes.length === 2 && 
                   modelTypes.includes(typeFilters[0].toLowerCase()) && 
                   modelTypes.includes(typeFilters[1].toLowerCase());
          }
          return true;
        });
      }
    } 
    else if (query.includes('type:')) {
      const typePart = query.split('type:')[1];
      if (typePart) {
        typeFilters = typePart.split(',').map(t => t.trim().toLowerCase());
        textQuery = query.split('type:')[0].trim();
        
        filteredResults = filteredResults.filter(model => {
          const pokemonTypes = model.apiData?.types.map((t: any) =>
            t.type.name.toLowerCase()
          ) || [];
          
          return typeFilters.some(type => pokemonTypes.includes(type));
        });
      }
    }
    
    if (textQuery) {
      filteredResults = filteredResults.filter(model => {
        const nameMatch = model.name.toLowerCase().includes(textQuery.toLowerCase());
        const idMatch = model.id.toString().includes(textQuery);
        return nameMatch || idMatch;
      });
    }
    
    setFilteredModels(filteredResults);
  };

  useEffect(() => {
    setFilteredModels(models);
  }, [models]);

  const handleScroll = () => {
    setIsScrolling(true);

    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }

    scrollTimerRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  // cleanup on component unmount
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  // limit active models during scroll
  const canRenderDetailedModel = (index: number) => {
    if (isScrolling) {
      return visibleModelIndexes.includes(index) &&
        visibleModelIndexes.indexOf(index) < activeModelLimit;
    }

    return true;
  };

  if (loading) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Loading models...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '600px', width: '100%', ...style }}>
      {skippedModels.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {`${models.length} models loaded. ${skippedModels.length} models not found.`}
          </Typography>
        </Box>
      )}

      <Box sx={{ position: 'relative', mb: 2, zIndex: 2 }}> 
        <SearchBar
          onSearch={handleSearch}
          initialValue={searchQuery}
          placeholder="Search by name or ID, e.g., 001, bulbasaur"
          enableKeyboardShortcuts={true}
          showTypeFilters={true}
        />

        {searchQuery && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 1,
            py: 0.5,
            fontSize: '0.8rem'
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 'inherit' }}>
              Showing {filteredModels.length} of {models.length} Pokémon
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ 
        position: 'relative', 
        height: 'calc(100% - 65px)',
        mt: 1
      }}>
        <Virtuoso
          style={{ height: '100%', width: '100%', borderRadius: '8px' }}
          totalCount={filteredModels.length}
          overscan={500}
          scrollerRef={scrollerEl => {
            if (scrollerEl) {
              scrollerEl.addEventListener('scroll', handleScroll);
            }
          }}
          itemsRendered={(params: any) => {
            const startIndex = params.startIndex;
            const endIndex = params.endIndex;

            const visibleIndices = Array.from(
              { length: endIndex - startIndex + 1 },
              (_, i) => startIndex + i
            );
            setVisibleModelIndexes(visibleIndices);
          }}
          itemContent={(index) => (
            <Box sx={{ py: 2, px: 1 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Box key={`model-container-${filteredModels[index].id}`}>
                    <Paper
                      elevation={2}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        borderRadius: 2,
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: (theme) => `0 8px 16px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)'}`,
                        },
                        ...(expandedStats[filteredModels[index].id] === true && {
                          maxHeight: {
                            xs: 350,
                            md: 400
                          }
                        })
                      }}
                      onClick={() => handlePokemonClick(filteredModels[index].name.split(' ')[0].toLowerCase())}
                    >
                      <Box sx={{
                        position: 'relative',
                        flexGrow: 1,
                        height: '180px',
                      }}>
                        <LazyModelViewer
                          modelPath={filteredModels[index].modelPath}
                          height="100%"
                          autoRotate={!isScrolling && canRenderDetailedModel(index)}
                          scale={0.8}
                          lowerDetailWhenIdle={isScrolling || !canRenderDetailedModel(index)}
                          pokemonType={filteredModels[index].apiData?.types.map(
                            (typeInfo: any) => typeInfo.type.name
                          ) || ['normal']}
                        />
                      </Box>

                      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                        <Typography align="center" fontWeight="medium">
                          {capitalizePokemonName(filteredModels[index].name)}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          align="center"
                        >
                          {formatPokemonNumber(filteredModels[index].id)}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                          {filteredModels[index].apiData?.types.map((typeInfo: any) => (
                            <TypeIcon
                              key={typeInfo.type.name}
                              type={typeInfo.type.name}
                              size={32}
                              brightnessFactor={1.1}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 8, lg: 9 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}
                  >
                    <Card sx={{ mb: 2 }}>
                      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" component="h2">
                          {capitalizePokemonName(filteredModels[index].name)}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {filteredModels[index].apiData?.types.map((typeInfo: any) => (
                            <TypeIcon
                              key={typeInfo.type.name}
                              type={typeInfo.type.name}
                              size={40}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>

                    <Card sx={{ mb: 2 }}>
                      <CardHeader
                        title="Base Stats"
                        sx={{
                          '& .MuiCardHeader-title': {
                            fontSize: 'subtitle2.fontSize',
                            fontWeight: 'subtitle2.fontWeight',
                          }
                        }}
                        action={
                          <IconButton
                            onClick={() => toggleStats(filteredModels[index].id)}
                            aria-expanded={expandedStats[filteredModels[index].id]}
                            aria-label="toggle stats"
                            size="small"
                          >
                            {expandedStats[filteredModels[index].id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        }
                      />
                      <Collapse in={expandedStats[filteredModels[index].id] === true}>
                        <CardContent>
                          {filteredModels[index].apiData?.stats.map((stat: any) => (
                            <Box key={stat.stat.name} sx={{ mb: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                  {formatStatName(stat.stat.name)}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {stat.base_stat}
                                </Typography>
                              </Box>
                              <Box sx={{
                                height: 8,
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: 1,
                                overflow: 'hidden'
                              }}>
                                <Box
                                  sx={{
                                    height: '100%',
                                    width: `${Math.min((stat.base_stat / 255) * 100, 100)}%`,
                                    bgcolor: getStatColor(stat.stat.name),
                                    borderRadius: 1
                                  }}
                                />
                              </Box>
                            </Box>
                          ))}
                        </CardContent>
                      </Collapse>
                    </Card>

                    <Box sx={{ flexGrow: 1 }} />

                    <Card>
                      <CardHeader
                        title="Details"
                        sx={{
                          '& .MuiCardHeader-title': {
                            fontSize: 'subtitle2.fontSize',
                            fontWeight: 'subtitle2.fontWeight',
                          }
                        }}
                      />
                      <CardContent>
                        <Grid container spacing={2.5}>

                          <Grid size={{ xs: 6, md: 3 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="caption" color="text.secondary" gutterBottom>
                                Height
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {(filteredModels[index].apiData?.height / 10).toFixed(1)}m
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid size={{ xs: 6, md: 3 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="caption" color="text.secondary" gutterBottom>
                                Weight
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {(filteredModels[index].apiData?.weight / 10).toFixed(1)}kg
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="caption" color="text.secondary" gutterBottom>
                                Abilities
                              </Typography>
                              <Typography variant="body2" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                                {filteredModels[index].apiData?.abilities.map((a: any) =>
                                  a.ability.name.replace('-', ' ')
                                ).join(', ')}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        />
      </Box>
    </Box>
  );
};

export default ModelGallery;