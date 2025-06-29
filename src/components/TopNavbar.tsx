import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Box, 
  useMediaQuery, 
  useTheme, 
  Container
} from '@mui/material';
import SvgIcon from './ui/SvgIcon';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useLocation, useNavigate } from 'react-router';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Pokedex', path: '/Pokedex', icon: '/icons/Pokedex.svg' },
  // { label: 'Dashboard', path: '/dashboard' },
  // { label: 'Explore', path: '/explore' },
  // { label: 'Analytics', path: '/analytics' },
];

const TopNavbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleClose();
  };

  return (
    <AppBar 
      position="static" 
      elevation={4} 
      sx={{ 
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(25, 25, 25, 0.9)', 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
      }}
    >
      <Container maxWidth="xl" sx={{ px: 0 }}> {/* Remove container padding */}
        <Toolbar 
          disableGutters 
          sx={{ 
            minHeight: '64px',
            padding: 0 // Remove any default padding
          }}
        >
          {/* App title */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              ml: 2 // Add left margin to title only
            }}
          >
            DexBuilder
          </Typography>

          {isMobile ? (
            <Box>
              <IconButton
                size="large"
                edge="end"
                aria-label="menu"
                onClick={handleMenu}
                sx={{
                  color: 'inherit',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: theme.palette.primary.main,
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    transform: 'rotate(90deg)'
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
                // Replace PaperProps with slotProps
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: 'rgba(30, 30, 30, 0.95)', // Dark background
                      backdropFilter: 'blur(8px)',
                      borderRadius: 2,
                      mt: 0.5,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                    }
                  }
                }}
              >
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <MenuItem 
                      key={item.label} 
                      onClick={() => handleNavigation(item.path)}
                      selected={isActive}
                      sx={{
                        mx: 1,
                        borderRadius: 1,
                        my: 0.5,
                        transition: 'all 0.2s ease',
                        ...(isActive && {
                          color: theme.palette.primary.main,
                          bgcolor: 'rgba(255, 61, 77, 0.1)',
                          fontWeight: 'medium',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: '25%',
                            height: '50%',
                            width: 3,
                            bgcolor: theme.palette.primary.main,
                            borderRadius: '0 4px 4px 0'
                          }
                        }),
                        '&:hover': {
                          bgcolor: isActive 
                            ? 'rgba(255, 61, 77, 0.2)' 
                            : 'rgba(255, 255, 255, 0.08)',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SvgIcon src={item.icon} sx={{ fontSize: 20 }} />
                        {item.label}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Menu>
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              height: '100%', // Ensure Box has full height
              ml: 'auto'
            }}> 
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                
                return (
                  <Button 
                    key={item.label}
                    component={Link}
                    to={item.path}
                    disableRipple
                    sx={{
                      height: '64px', // Use exact pixel height instead of 100%
                      padding: '0 1.5rem', // Use fixed padding instead of px
                      margin: 0, // Ensure no margins
                      borderRadius: 0,
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      color: 'white',
                      
                      // Inactive buttons - raised effect
                      ...(!isActive && {
                        boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.1) inset',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                        transform: 'translateY(-2px)', // Slightly raised
                        borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
                        '&:hover': {
                          boxShadow: '0 -2px 10px rgba(255,61,77,0.2) inset',
                          background: 'linear-gradient(180deg, rgba(255,61,77,0.15) 0%, rgba(255,61,77,0.05) 100%)',
                        },
                      }),
                      
                      // Active button - pressed down effect
                      ...(isActive && {
                        background: 'linear-gradient(180deg, rgba(255,61,77,0.25) 0%, rgba(255,61,77,0.15) 100%)',
                        boxShadow: '0 3px 5px rgba(0, 0, 0, 0.3) inset', // Inset shadow creates "pressed" look
                        transform: 'translateY(0px)', // No raise - looks pushed down
                        borderTop: '1px solid rgba(0, 0, 0, 0.2)', // Dark edge at top when pressed
                        color: theme.palette.primary.main,
                      }),
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      gap: 0.5
                    }}>
                      {/* Icon above text - like a physical button */}
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        color: isActive ? theme.palette.primary.main : 'inherit',
                        filter: isActive ? 'drop-shadow(0 0 3px rgba(255,61,77,0.5))' : 'none',
                        transform: isActive ? 'scale(1.2)' : 'scale(1)', // Icon grows when active
                        transition: 'all 0.2s ease',
                      }}>
                        <SvgIcon src={item.icon} />
                      </Box>
                      
                      {/* Label below icon */}
                      <Typography 
                        variant="button" 
                        sx={{
                          fontSize: '0.8rem',
                          fontWeight: isActive ? 'bold' : 'medium',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                  </Button>
                );
              })}
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default TopNavbar;