import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import api from '../services/api';

interface FavoriteButtonProps {
  type: 'restaurant' | 'product';
  id: string;
  size?: 'small' | 'medium' | 'large';
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  type,
  id,
  size = 'medium',
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, [id, type]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await api.get(`/favorites/${type}/${id}/check`);
      setIsFavorited(response.data.data.isFavorited);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      if (isFavorited) {
        await api.delete(`/favorites/${type}/${id}`);
        setIsFavorited(false);
      } else {
        await api.post(`/favorites/${type}/${id}`);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IconButton
      onClick={toggleFavorite}
      disabled={loading}
      size={size}
      color={isFavorited ? 'error' : 'default'}
    >
      {isFavorited ? <Favorite /> : <FavoriteBorder />}
    </IconButton>
  );
};

export default FavoriteButton;
