import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { Delete, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Restaurant {
  _id: string;
  name: string;
  imageUrl: string;
  cuisine: string;
  rating: number;
  address: string;
}

interface Product {
  _id: string;
  name: string;
  imageUrl: string;
  price: number;
  restaurant: string;
}

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favorites');
      setRestaurants(response.data.data.restaurants || []);
      setProducts(response.data.data.products || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeRestaurantFavorite = async (restaurantId: string) => {
    try {
      await api.delete(`/favorites/restaurant/${restaurantId}`);
      setRestaurants(restaurants.filter((r) => r._id !== restaurantId));
      setSuccess('Removed from favorites');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove');
    }
  };

  const removeProductFavorite = async (productId: string) => {
    try {
      await api.delete(`/favorites/product/${productId}`);
      setProducts(products.filter((p) => p._id !== productId));
      setSuccess('Removed from favorites');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6FA', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          My Favorites
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ mb: 3 }}
        >
          <Tab label={`Restaurants (${restaurants.length})`} />
          <Tab label={`Dishes (${products.length})`} />
        </Tabs>

        {activeTab === 0 && (
          <>
            {restaurants.length === 0 ? (
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No favorite restaurants yet
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/')}
                  sx={{ mt: 2 }}
                >
                  Explore Restaurants
                </Button>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {restaurants.map((restaurant) => (
                  <Grid item xs={12} sm={6} md={4} key={restaurant._id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-4px)' },
                      }}
                      onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                    >
                      <CardMedia
                        component="img"
                        height="180"
                        image={restaurant.imageUrl}
                        alt={restaurant.name}
                      />
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {restaurant.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {restaurant.cuisine}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {restaurant.address}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Rating: {restaurant.rating}
                            </Typography>
                          </Box>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRestaurantFavorite(restaurant._id);
                            }}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {activeTab === 1 && (
          <>
            {products.length === 0 ? (
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No favorite dishes yet
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/')}
                  sx={{ mt: 2 }}
                >
                  Explore Menu
                </Button>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {products.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product._id}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="180"
                        image={product.imageUrl}
                        alt={product.name}
                      />
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {product.name}
                            </Typography>
                            <Typography
                              variant="h6"
                              color="primary"
                              fontWeight="bold"
                            >
                              ${product.price.toFixed(2)}
                            </Typography>
                          </Box>
                          <IconButton
                            onClick={() => removeProductFavorite(product._id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          sx={{ mt: 2 }}
                          onClick={() => navigate(`/restaurant/${product.restaurant}`)}
                          endIcon={<ArrowForward />}
                        >
                          View Restaurant
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default Favorites;
