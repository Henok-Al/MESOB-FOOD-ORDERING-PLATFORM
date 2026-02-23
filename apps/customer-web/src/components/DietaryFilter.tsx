import React from 'react';
import {
  Box,
  Chip,
  Typography,
  Paper,
} from '@mui/material';
import {
  LocalFlorist,
  LocalDining,
  NoMeals,
  Spa,
  Warning,
  Favorite,
} from '@mui/icons-material';

export type DietaryPreference =
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'keto'
  | 'halal'
  | 'kosher'
  | 'nut-free'
  | 'organic'
  | 'low-carb'
  | 'high-protein';

interface DietaryFilterProps {
  selected: DietaryPreference[];
  onChange: (preferences: DietaryPreference[]) => void;
}

const dietaryOptions: Array<{
  value: DietaryPreference;
  label: string;
  icon: React.ReactNode;
  color: string;
}> = [
  { value: 'vegetarian', label: 'Vegetarian', icon: <LocalFlorist />, color: '#4CAF50' },
  { value: 'vegan', label: 'Vegan', icon: <Spa />, color: '#8BC34A' },
  { value: 'gluten-free', label: 'Gluten-Free', icon: <NoMeals />, color: '#FF9800' },
  { value: 'dairy-free', label: 'Dairy-Free', icon: <Warning />, color: '#2196F3' },
  { value: 'keto', label: 'Keto', icon: <Favorite />, color: '#9C27B0' },
  { value: 'halal', label: 'Halal', icon: <LocalDining />, color: '#009688' },
  { value: 'kosher', label: 'Kosher', icon: <LocalDining />, color: '#673AB7' },
  { value: 'nut-free', label: 'Nut-Free', icon: <Warning />, color: '#F44336' },
  { value: 'organic', label: 'Organic', icon: <LocalFlorist />, color: '#4CAF50' },
  { value: 'low-carb', label: 'Low-Carb', icon: <Favorite />, color: '#FF5722' },
  { value: 'high-protein', label: 'High-Protein', icon: <LocalDining />, color: '#795548' },
];

const DietaryFilter: React.FC<DietaryFilterProps> = ({ selected, onChange }) => {
  const handleToggle = (preference: DietaryPreference) => {
    if (selected.includes(preference)) {
      onChange(selected.filter((p) => p !== preference));
    } else {
      onChange([...selected, preference]);
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Dietary Preferences
        </Typography>
        {selected.length > 0 && (
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: 'pointer' }}
            onClick={handleClear}
          >
            Clear all
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {dietaryOptions.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <Chip
              key={option.value}
              icon={option.icon}
              label={option.label}
              onClick={() => handleToggle(option.value)}
              sx={{
                backgroundColor: isSelected ? option.color : 'transparent',
                color: isSelected ? 'white' : 'text.primary',
                border: `1px solid ${option.color}`,
                '&:hover': {
                  backgroundColor: isSelected ? option.color : `${option.color}20`,
                },
                transition: 'all 0.2s',
              }}
            />
          );
        })}
      </Box>

      {selected.length > 0 && (
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="body2" color="text.secondary">
            Filtering by: {selected.map((s) => dietaryOptions.find((o) => o.value === s)?.label).join(', ')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default DietaryFilter;
