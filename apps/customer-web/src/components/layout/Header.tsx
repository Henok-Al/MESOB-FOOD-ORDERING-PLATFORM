import { useState } from 'react';
import { AppBar, Toolbar, Box, Button, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { LocationOn, KeyboardArrowDown } from '@mui/icons-material';
import { FRANK_COLORS } from '@food-ordering/constants';

export default function Header() {
  const [locationAnchor, setLocationAnchor] = useState<null | HTMLElement>(null);

  const navItems = [
    { label: 'Place an order', active: true },
    { label: 'Restaurants', active: false },
    { label: 'Merch', active: false },
    { label: 'Career', active: false },
    { label: 'Gift certificates', active: false },
    { label: 'About us', active: false },
  ];

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: FRANK_COLORS.bgPrimary, 
        borderBottom: `1px solid ${FRANK_COLORS.border}`,
        boxShadow: 'none',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 800, 
              color: '#fff', 
              fontSize: '1.5rem',
              letterSpacing: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Box 
              component="span" 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: '#fff', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ color: '#000', fontWeight: 800, fontSize: '0.75rem' }}>F</Typography>
            </Box>
            FRANK
          </Typography>

          {/* Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, ml: 4 }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                sx={{
                  color: item.active ? '#fff' : FRANK_COLORS.textSecondary,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  '&:hover': { color: '#fff' },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Right Side - Location & Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Location Dropdown */}
          <Button
            onClick={(e) => setLocationAnchor(e.currentTarget)}
            startIcon={<LocationOn sx={{ fontSize: 18 }} />}
            endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
            sx={{
              color: '#fff',
              fontWeight: 500,
              fontSize: '0.875rem',
              textTransform: 'none',
            }}
          >
            St. Petersburg
          </Button>

          <Menu
            anchorEl={locationAnchor}
            open={Boolean(locationAnchor)}
            onClose={() => setLocationAnchor(null)}
            PaperProps={{
              sx: {
                background: FRANK_COLORS.bgCard,
                border: `1px solid ${FRANK_COLORS.border}`,
                color: '#fff',
              }
            }}
          >
            <MenuItem onClick={() => setLocationAnchor(null)}>St. Petersburg</MenuItem>
            <MenuItem onClick={() => setLocationAnchor(null)}>Moscow</MenuItem>
          </Menu>

          {/* Language */}
          <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>EN</Typography>

          {/* Book Now Button */}
          <Button
            variant="contained"
            sx={{
              background: '#fff',
              color: '#000',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '24px',
              px: 3,
              '&:hover': { background: '#f0f0f0' },
            }}
          >
            Book now
          </Button>

          {/* Log In Button */}
          <Button
            variant="outlined"
            sx={{
              color: '#fff',
              borderColor: 'rgba(255,255,255,0.5)',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '24px',
              px: 3,
              '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.1)' },
            }}
          >
            Log in
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
