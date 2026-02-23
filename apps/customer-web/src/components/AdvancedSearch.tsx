import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Slider,
  Typography,
  Chip,
  IconButton,
  Paper,
  Grid,
} from '@mui/material';
import { Search, FilterList, Clear } from '@mui/icons-material';

interface SearchFilters {
  query: string;
  cuisine: string;
  rating: number | null;
  priceRange: [number, number];
  sortBy: string;
  deliveryTime: number | null;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  cuisines: string[];
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, cuisines }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    cuisine: '',
    rating: null,
    priceRange: [0, 100],
    sortBy: 'rating',
    deliveryTime: null,
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      cuisine: '',
      rating: null,
      priceRange: [0, 100],
      sortBy: 'rating',
      deliveryTime: null,
    });
    onSearch({
      query: '',
      cuisine: '',
      rating: null,
      priceRange: [0, 100],
      sortBy: 'rating',
      deliveryTime: null,
    });
  };

  const hasActiveFilters =
    filters.query ||
    filters.cuisine ||
    filters.rating ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 100 ||
    filters.deliveryTime;

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search restaurants, dishes, cuisines..."
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          startIcon={<Search />}
        >
          Search
        </Button>
        <Button
          variant="outlined"
          onClick={() => setShowFilters(!showFilters)}
          startIcon={<FilterList />}
        >
          Filters
        </Button>
        {hasActiveFilters && (
          <IconButton onClick={clearFilters} color="error">
            <Clear />
          </IconButton>
        )}
      </Box>

      {showFilters && (
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Cuisine</InputLabel>
                <Select
                  value={filters.cuisine}
                  label="Cuisine"
                  onChange={(e) =>
                    setFilters({ ...filters, cuisine: e.target.value })
                  }
                >
                  <MenuItem value="">All Cuisines</MenuItem>
                  {cuisines.map((cuisine) => (
                    <MenuItem key={cuisine} value={cuisine}>
                      {cuisine}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Minimum Rating</InputLabel>
                <Select
                  value={filters.rating || ''}
                  label="Minimum Rating"
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      rating: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                >
                  <MenuItem value="">Any Rating</MenuItem>
                  <MenuItem value={4.5}>4.5+ Stars</MenuItem>
                  <MenuItem value={4}>4+ Stars</MenuItem>
                  <MenuItem value={3.5}>3.5+ Stars</MenuItem>
                  <MenuItem value={3}>3+ Stars</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  label="Sort By"
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value })
                  }
                >
                  <MenuItem value="rating">Highest Rated</MenuItem>
                  <MenuItem value="deliveryTime">Fastest Delivery</MenuItem>
                  <MenuItem value="price_low">Price: Low to High</MenuItem>
                  <MenuItem value="price_high">Price: High to Low</MenuItem>
                  <MenuItem value="popularity">Most Popular</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Max Delivery Time</InputLabel>
                <Select
                  value={filters.deliveryTime || ''}
                  label="Max Delivery Time"
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      deliveryTime: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                >
                  <MenuItem value="">Any Time</MenuItem>
                  <MenuItem value={30}>Under 30 min</MenuItem>
                  <MenuItem value={45}>Under 45 min</MenuItem>
                  <MenuItem value={60}>Under 60 min</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>Price Range</Typography>
            <Slider
              value={filters.priceRange}
              onChange={(_, value) =>
                setFilters({ ...filters, priceRange: value as [number, number] })
              }
              valueLabelDisplay="auto"
              min={0}
              max={100}
              marks={[
                { value: 0, label: '$0' },
                { value: 25, label: '$25' },
                { value: 50, label: '$50' },
                { value: 75, label: '$75' },
                { value: 100, label: '$100+' },
              ]}
            />
          </Box>
        </Box>
      )}

      {hasActiveFilters && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            Active Filters:
          </Typography>
          {filters.query && (
            <Chip
              size="small"
              label={`Search: ${filters.query}`}
              onDelete={() => setFilters({ ...filters, query: '' })}
            />
          )}
          {filters.cuisine && (
            <Chip
              size="small"
              label={`Cuisine: ${filters.cuisine}`}
              onDelete={() => setFilters({ ...filters, cuisine: '' })}
            />
          )}
          {filters.rating && (
            <Chip
              size="small"
              label={`Rating: ${filters.rating}+`}
              onDelete={() => setFilters({ ...filters, rating: null })}
            />
          )}
          {filters.deliveryTime && (
            <Chip
              size="small"
              label={`Delivery: Under ${filters.deliveryTime} min`}
              onDelete={() => setFilters({ ...filters, deliveryTime: null })}
            />
          )}
        </Box>
      )}
    </Paper>
  );
};

export default AdvancedSearch;
