import { Request, Response } from 'express';
import Restaurant from '../models/Restaurant';

export const getRestaurants = async (req: Request, res: Response): Promise<void> => {
    try {
        const restaurants = await Restaurant.find({ isActive: true });

        res.status(200).json({
            status: 'success',
            results: restaurants.length,
            data: {
                restaurants,
            },
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

export const createRestaurant = async (req: Request, res: Response): Promise<void> => {
    try {
        const newRestaurant = await Restaurant.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                restaurant: newRestaurant,
            },
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

// Seed some data
export const seedRestaurants = async (req: Request, res: Response): Promise<void> => {
    try {
        // Clear existing data to avoid duplicates/conflicts
        await Restaurant.deleteMany({});

        await Restaurant.create([
            {
                name: 'Burger King',
                description: 'American, Fast Food, Burgers',
                address: '123 Main St',
                rating: 4.2,
                imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80',
                deliveryTime: '20-30 min',
                minOrder: 15,
            },
            {
                name: 'Pizza Hut',
                description: 'Italian, Pizza, Fast Food',
                address: '456 Oak Ave',
                rating: 4.5,
                imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
                deliveryTime: '30-45 min',
                minOrder: 20,
            },
            {
                name: 'Sushi Master',
                description: 'Japanese, Sushi, Asian',
                address: '789 Pine Ln',
                rating: 4.8,
                imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
                deliveryTime: '40-50 min',
                minOrder: 25,
            },
        ]);
        res.status(201).json({ status: 'success', message: 'Seeded successfully' });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};
