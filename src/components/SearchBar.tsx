import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Popover,
  Typography,
  Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import TypeIcon from './ui/TypeIcon'; // Import your existing TypeIcon component
import { TYPE_COLORS } from './ui/TypeIcon'; // Import the color mapping directly if possible
import useKeyboardNavigation from '../hooks/useKeyboardNavigation';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  delay?: number;
  sx?: any;
  showTypeFilters?: boolean;
  enableKeyboardShortcuts?: boolean; // Add this prop
}

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic',
  'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search Pokémon by name or number...",
  initialValue = '',
  delay = 300,
  sx,
  showTypeFilters = false,
  enableKeyboardShortcuts = true
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    onSearch('');
  };

  useKeyboardNavigation({
    inputRef,
    query: searchTerm,
    onClear: handleClear,
    enableGlobalShortcut: enableKeyboardShortcuts,
  });

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Construct search query for exact type matching
      let query = searchTerm;
      if (selectedTypes.length > 0) {
        // Use a special syntax that your search handler will recognize for exact matching
        query = `${query} exacttype:${selectedTypes.join(',')}`;
      }
      onSearch(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedTypes, delay, onSearch]);

  // Modify the toggleTypeFilter function to limit to 2 types
  const toggleTypeFilter = (type: string) => {
    setSelectedTypes(prev => {
      // If the type is already selected, remove it
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      }
      // If we already have 2 types selected and trying to add more
      else if (prev.length >= 2) {
        // Optional: Show a toast or notification here
        console.log("Maximum of 2 types can be selected");
        return prev; // Don't change the selection
      }
      // Otherwise add the new type
      else {
        return [...prev, type];
      }
    });
  };

  return (
    <Box sx={{ width: '100%', mb: 0 }}> {/* Removed mb: 3 */}
      <TextField
        inputRef={inputRef}
        fullWidth
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {(searchTerm || selectedTypes.length > 0) && (
                <IconButton size="small" onClick={handleClear}>
                  <ClearIcon />
                </IconButton>
              )}
              {showTypeFilters && (
                <IconButton
                  size="small"
                  onClick={() => setShowFilters(!showFilters)}
                  color={showFilters ? "primary" : "default"}
                  title="Filter by type"
                >
                  <FilterListIcon />
                </IconButton>
              )}
            </InputAdornment>
          ),
          sx: {
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }
          }
        }}
        sx={{ mb: 0 }}
      />

      {/* Move type filters to a popup/popover with icons */}
      {showTypeFilters && showFilters && (
        <Popover
          open={showFilters}
          anchorEl={inputRef.current}
          onClose={() => setShowFilters(false)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          sx={{ mt: 1 }}
        >
          <Box sx={{
            p: 2,
            maxWidth: 500,
            bgcolor: 'background.paper',
            borderRadius: 1
          }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, textAlign: 'center' }}>
              Filter by Pokémon Type
            </Typography>

            <Grid container spacing={1.5} justifyContent="center">
              {POKEMON_TYPES.map(type => {
                const isSelected = selectedTypes.includes(type);
                const typeColor = TYPE_COLORS[type.toLowerCase()] || '#A0A29F';
                // Determine if this type can be selected (either it's already selected or we have fewer than 2 types selected)
                const canBeSelected = isSelected || selectedTypes.length < 2;

                return (
                  <Grid key={type}>
                    <Box
                      onClick={() => canBeSelected && toggleTypeFilter(type)}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 1,
                        cursor: canBeSelected ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                        bgcolor: isSelected ? `${typeColor}15` : 'transparent',
                        opacity: canBeSelected ? 1 : 0.5, // Dim types that can't be selected
                        // Add a subtle glow effect when selected
                        boxShadow: isSelected ? `0 0 8px ${typeColor}88` : 'none',
                        '&:hover': canBeSelected ? {
                          bgcolor: isSelected ? `${typeColor}22` : 'rgba(0,0,0,0.04)',
                          transform: 'translateY(-2px)',
                        } : {}
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          animation: isSelected ? 'pulse 2s infinite' : 'none',
                          '@keyframes pulse': {
                            '0%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.05)' },
                            '100%': { transform: 'scale(1)' }
                          },
                          // Add a subtle glow behind the icon
                          '&::after': isSelected ? {
                            content: '""',
                            position: 'absolute',
                            top: '-4px',
                            left: '-4px',
                            right: '-4px',
                            bottom: '-4px',
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${typeColor}66 0%, transparent 70%)`,
                            zIndex: -1,
                            filter: 'blur(4px)',
                          } : {}
                        }}
                      >
                        <TypeIcon
                          type={type}
                          size={40}
                          brightnessFactor={isSelected ? 1.2 : 0.8}
                        />
                      </Box>

                      <Typography
                        variant="caption"
                        sx={{
                          mt: 0.5,
                          textTransform: 'capitalize',
                          fontWeight: isSelected ? 600 : 400,
                          color: isSelected ? typeColor : 'text.secondary',
                          // Add text glow for selected items
                          textShadow: isSelected ? `0 0 1px ${typeColor}88` : 'none',
                        }}
                      >
                        {type}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Popover>
      )}

      {/* Show selected types as pills in the main UI with icons */}
      {selectedTypes.length > 0 && (
        <Box sx={{
          mt: 0.5,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5
        }}>
          {selectedTypes.map(type => {
            const typeColor = TYPE_COLORS[type.toLowerCase()] || '#A0A29F';

            return (
              <Chip
                key={type}
                label={type}
                size="small"
                deleteIcon={<ClearIcon fontSize="small" />}
                onDelete={() => toggleTypeFilter(type)}
                icon={<TypeIcon type={type} size={16} />}
                sx={{
                  textTransform: 'capitalize',
                  height: '24px',
                  backgroundColor: `${typeColor}22`,
                  color: typeColor,
                  fontWeight: 500,
                  border: `1px solid ${typeColor}44`,
                  '& .MuiChip-icon': {
                    color: typeColor,
                    marginLeft: '4px'
                  },
                  '& .MuiChip-deleteIcon': {
                    color: typeColor,
                    '&:hover': {
                      color: `${typeColor}BB`
                    }
                  }
                }}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default SearchBar;