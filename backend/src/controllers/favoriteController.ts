import { Request, Response } from 'express';
import Favorite from '../models/Favorite';
import Restaurant from '../models/Restaurant';
import Product from '../models/Product';

// @desc    Add restaurant to favorites
// @route   POST /api/favorites/restaurant/:restaurantId
// @access  Private
export const addRestaurantFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const userId = (req as any).user._id;

    // Check if already favorited
    const existing = await Favorite.findOne({ user: userId, restaurant: restaurantId });
    if (existing) {
      res.status(400).json({ status: 'fail', message: 'Restaurant already in favorites' });
      return;
    }

    const favorite = await Favorite.create({
      user: userId,
      restaurant: restaurantId,
    });

    res.status(201).json({
      status: 'success',
      data: { favorite },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Remove restaurant from favorites
// @route   DELETE /api/favorites/restaurant/:restaurantId
// @access  Private
export const removeRestaurantFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const userId = (req as any).user._id;

    await Favorite.findOneAndDelete({ user: userId, restaurant: restaurantId });

    res.status(200).json({
      status: 'success',
      message: 'Removed from favorites',
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Add product to favorites
// @route   POST /api/favorites/product/:productId
// @access  Private
export const addProductFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const userId = (req as any).user._id;

    // Check if already favorited
    const existing = await Favorite.findOne({ user: userId, product: productId });
    if (existing) {
      res.status(400).json({ status: 'fail', message: 'Product already in favorites' });
      return;
    }

    const favorite = await Favorite.create({
      user: userId,
      product: productId,
    });

    res.status(201).json({
      status: 'success',
      data: { favorite },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Remove product from favorites
// @route   DELETE /api/favorites/product/:productId
// @access  Private
export const removeProductFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const userId = (req as any).user._id;

    await Favorite.findOneAndDelete({ user: userId, product: productId });

    res.status(200).json({
      status: 'success',
      message: 'Removed from favorites',
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private
export const getMyFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;

    const favorites = await Favorite.find({ user: userId })
      .populate('restaurant', 'name imageUrl cuisine rating address')
      .populate('product', 'name imageUrl price restaurant')
      .sort({ createdAt: -1 });

    // Separate restaurants and products
    const restaurants = favorites.filter((f) => f.restaurant).map((f) => f.restaurant);
    const products = favorites.filter((f) => f.product).map((f) => f.product);

    res.status(200).json({
      status: 'success',
      data: { restaurants, products },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Check if restaurant is favorited
// @route   GET /api/favorites/restaurant/:restaurantId/check
// @access  Private
export const checkRestaurantFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const userId = (req as any).user._id;

    const favorite = await Favorite.findOne({ user: userId, restaurant: restaurantId });

    res.status(200).json({
      status: 'success',
      data: { isFavorited: !!favorite },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Check if product is favorited
// @route   GET /api/favorites/product/:productId/check
// @access  Private
export const checkProductFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const userId = (req as any).user._id;

    const favorite = await Favorite.findOne({ user: userId, product: productId });

    res.status(200).json({
      status: 'success',
      data: { isFavorited: !!favorite },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};
