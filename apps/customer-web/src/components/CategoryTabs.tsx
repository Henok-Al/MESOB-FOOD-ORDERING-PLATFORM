import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { FRANK_COLORS } from '@food-ordering/constants';

const categories = [
  'Ribs',
  'Street Food', 
  'Hot Dishes',
  'Wings',
  'Salads',
  'Snacks',
  'Soups',
  'Side Dishes',
  'Desserts',
  'Combo',
  'Sauces',
];

export default function CategoryTabs() {
  const [activeCategory, setActiveCategory] = useState('Ribs');

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 2,
        px: 3,
        borderBottom: `1px solid ${FRANK_COLORS.border}`,
        overflowX: 'auto',
        background: FRANK_COLORS.bgPrimary,
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
      }}
    >
      {categories.map((category) => (
        <Button
          key={category}
          onClick={() => setActiveCategory(category)}
          sx={{
            color: activeCategory === category ? '#fff' : FRANK_COLORS.textSecondary,
            fontWeight: activeCategory === category ? 700 : 500,
            fontSize: '0.9375rem',
            textTransform: 'none',
            whiteSpace: 'nowrap',
            position: 'relative',
            py: 1,
            '&::after': activeCategory === category ? {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              background: FRANK_COLORS.error,
              borderRadius: 1,
            } : {},
            '&:hover': {
              color: '#fff',
              background: 'transparent',
            },
          }}
        >
          {category}
        </Button>
      ))}
      
      <Button
        sx={{
          color: '#fff',
          minWidth: 'auto',
          p: 0.5,
        }}
      >
        <ChevronRight />
      </Button>
    </Box>
  );
}
