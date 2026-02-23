import { Request, Response } from 'express';
import Restaurant from '../models/Restaurant';
import Product from '../models/Product';

// @desc    Advanced search for restaurants and dishes
// @route   GET /api/search
// @access  Public
export const advancedSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      query,
      type,
      cuisine,
      minRating,
      maxDeliveryTime,
      priceRange,
      dietary,
      sortBy = 'relevance',
      page = 1,
      limit = 20,
      lat,
      lng,
      radius = 10, // km
    } = req.query;

    const results: any = {
      restaurants: [],
      dishes: [],
      totalRestaurants: 0,
      totalDishes: 0,
    };

    // Search Restaurants
    if (!type || type === 'restaurant' || type === 'all') {
      const restaurantQuery: any = { status: 'active' };

      // Text search
      if (query) {
        restaurantQuery.$or = [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { cuisine: { $regex: query, $options: 'i' } },
        ];
      }

      // Cuisine filter
      if (cuisine) {
        restaurantQuery.cuisine = { $in: (cuisine as string).split(',') };
      }

      // Rating filter
      if (minRating) {
        restaurantQuery.rating = { $gte: parseFloat(minRating as string) };
      }

      // Delivery time filter
      if (maxDeliveryTime) {
        restaurantQuery.estimatedDeliveryTime = { $lte: parseInt(maxDeliveryTime as string) };
      }

      // Price range filter
      if (priceRange) {
        restaurantQuery.priceRange = { $in: (priceRange as string).split(',') };
      }

      // Sorting
      let sortOption: any = {};
      if (sortBy === 'rating') sortOption = { rating: -1 };
      else if (sortBy === 'deliveryTime') sortOption = { estimatedDeliveryTime: 1 };
      else if (sortBy === 'newest') sortOption = { createdAt: -1 };
      else if (sortBy === 'popular') sortOption = { orderCount: -1 };

      const skip = (Number(page) - 1) * Number(limit);

      results.restaurants = await Restaurant.find(restaurantQuery)
        .select('-menu') // Exclude large menu data
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit));

      results.totalRestaurants = await Restaurant.countDocuments(restaurantQuery);
    }

    // Search Dishes/Products
    if (!type || type === 'dish' || type === 'all') {
      const dishQuery: any = {};

      // Text search
      if (query) {
        dishQuery.$or = [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ];
      }

      // Price range filter
      if (priceRange) {
        const ranges = (priceRange as string).split(',');
        const priceConditions: any[] = [];
        
        ranges.forEach((range) => {
          if (range === '$') priceConditions.push({ price: { $lt: 10 } });
          if (range === '$$') priceConditions.push({ price: { $gte: 10, $lt: 20 } });
          if (range === '$$$') priceConditions.push({ price: { $gte: 20, $lt: 30 } });
          if (range === '$$$$') priceConditions.push({ price: { $gte: 30 } });
        });
        
        if (priceConditions.length > 0) {
          dishQuery.$or = priceConditions;
        }
      }

      // Dietary preferences filter
      if (dietary) {
        const dietaryTags = (dietary as string).split(',');
        dishQuery.dietaryTags = { $in: dietaryTags };
      }

      const skip = (Number(page) - 1) * Number(limit);

      results.dishes = await Product.find(dishQuery)
        .populate('restaurant', 'name rating estimatedDeliveryTime')
        .sort({ orderCount: -1 })
        .skip(skip)
        .limit(Number(limit));

      results.totalDishes = await Product.countDocuments(dishQuery);
    }

    res.status(200).json({
      status: 'success',
      data: results,
      page: Number(page),
      totalPages: Math.ceil(
        (results.totalRestaurants + results.totalDishes) / Number(limit)
      ),
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get search suggestions
// @route   GET /api/search/suggestions
// @access  Public
export const getSearchSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;

    if (!query || (query as string).length < 2) {
      res.status(200).json({
        status: 'success',
        data: { suggestions: [] },
      });
      return;
    }

    const searchRegex = { $regex: query, $options: 'i' };

    // Get restaurant suggestions
    const restaurants = await Restaurant.find({
      name: searchRegex,
      status: 'active',
    })
      .select('name cuisine')
      .limit(5);

    // Get dish suggestions
    const dishes = await Product.find({
      name: searchRegex,
    })
      .select('name category')
      .populate('restaurant', 'name')
      .limit(5);

    // Get cuisine suggestions
    const cuisines = await Restaurant.distinct('cuisine', {
      cuisine: searchRegex,
    });

    const suggestions = [
      ...restaurants.map((r) => ({
        type: 'restaurant',
        name: r.name,
        subtitle: r.cuisine,
      })),
      ...dishes.map((d) => ({
        type: 'dish',
        name: d.name,
        subtitle: d.restaurant?.name,
      })),
      ...cuisines.slice(0, 3).map((c) => ({
        type: 'cuisine',
        name: c,
        subtitle: 'Cuisine',
      })),
    ];

    res.status(200).json({
      status: 'success',
      data: { suggestions },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get popular searches
// @route   GET /api/search/popular
// @access  Public
export const getPopularSearches = async (req: Request, res: Response): Promise<void> => {
  try {
    // In production, this would come from analytics
    // For now, return static popular searches
    const popularSearches = [
      'Pizza',
      'Burger',
      'Sushi',
      'Indian',
      'Chinese',
      'Italian',
      'Tacos',
      'Healthy',
      'Breakfast',
      'Dessert',
    ];

    res.status(200).json({
      status: 'success',
      data: { popularSearches },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get search filters (cuisines, dietary options, etc.)
// @route   GET /api/search/filters
// @access  Public
export const getSearchFilters = async (req: Request, res: Response): Promise<void> => {
  try {
    const cuisines = await Restaurant.distinct('cuisine');
    const dietaryTags = await Product.distinct('dietaryTags');

    res.status(200).json({
      status: 'success',
      data: {
        cuisines: cuisines.sort(),
        dietaryOptions: dietaryTags.sort(),
        priceRanges: [
          { value: '$', label: '$', description: 'Under $10' },
          { value: '$$', label: '$$', description: '$10 - $20' },
          { value: '$$$', label: '$$$', description: '$20 - $30' },
          { value: '$$$$', label: '$$$$', description: 'Over $30' },
        ],
        sortOptions: [
          { value: 'relevance', label: 'Relevance' },
          { value: 'rating', label: 'Rating' },
          { value: 'deliveryTime', label: 'Delivery Time' },
          { value: 'newest', label: 'Newest' },
          { value: 'popular', label: 'Most Popular' },
        ],
        maxDeliveryTimes: [
          { value: 15, label: 'Under 15 min' },
          { value: 30, label: 'Under 30 min' },
          { value: 45, label: 'Under 45 min' },
          { value: 60, label: 'Under 60 min' },
        ],
        ratings: [
          { value: 4.5, label: '4.5+' },
          { value: 4.0, label: '4.0+' },
          { value: 3.5, label: '3.5+' },
        ],
      },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};
