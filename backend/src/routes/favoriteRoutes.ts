import express from 'express';
import {
  addRestaurantFavorite,
  removeRestaurantFavorite,
  addProductFavorite,
  removeProductFavorite,
  getMyFavorites,
  checkRestaurantFavorite,
  checkProductFavorite,
} from '../controllers/favoriteController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

// Get all favorites
router.get('/', getMyFavorites);

// Restaurant favorites
router.post('/restaurant/:restaurantId', addRestaurantFavorite);
router.delete('/restaurant/:restaurantId', removeRestaurantFavorite);
router.get('/restaurant/:restaurantId/check', checkRestaurantFavorite);

// Product favorites
router.post('/product/:productId', addProductFavorite);
router.delete('/product/:productId', removeProductFavorite);
router.get('/product/:productId/check', checkProductFavorite);

export default router;
