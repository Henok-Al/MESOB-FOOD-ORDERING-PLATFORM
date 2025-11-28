import { Request, Response } from 'express';
import Product from '../models/Product';
import Restaurant, { IRestaurant } from '../models/Restaurant';

export const getProductsByRestaurant = async (req: Request, res: Response): Promise<void> => {
    try {
        const { restaurantId } = req.params;
        const products = await Product.find({ restaurant: restaurantId, isAvailable: true });

        res.status(200).json({
            status: 'success',
            results: products.length,
            data: {
                products,
            },
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                product,
            },
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

export const seedProducts = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        await Product.deleteMany({});

        const restaurants = await Restaurant.find();
        if (restaurants.length === 0) {
            return res.status(400).json({ status: 'fail', message: 'No restaurants found to seed products for' });
        }

        const products: any[] = [];

        // Helper to find restaurant by name (partial match)
        const findRest = (name: string) => restaurants.find((r: IRestaurant) => r.name.includes(name));

        const burgerKing = findRest('Burger');
        if (burgerKing) {
            products.push(
                {
                    name: 'Whopper Meal',
                    description: 'Flame-grilled beef patty, topped with tomatoes, fresh cut lettuce, mayo, pickles, a swirl of ketchup, and white onions on a soft sesame seed bun.',
                    price: 9.99,
                    category: 'Burgers',
                    restaurant: burgerKing._id,
                    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                },
                {
                    name: 'Chicken Fries',
                    description: 'Breaded, crispy white meat chicken perfect for dipping in any of our delicious dipping sauces.',
                    price: 4.99,
                    category: 'Sides',
                    restaurant: burgerKing._id,
                    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                }
            );
        }

        const pizzaHut = findRest('Pizza');
        if (pizzaHut) {
            products.push(
                {
                    name: 'Pepperoni Lover\'s Pizza',
                    description: 'Loaded with pepperoni and mozzarella cheese.',
                    price: 14.99,
                    category: 'Pizza',
                    restaurant: pizzaHut._id,
                    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                },
                {
                    name: 'Supreme Pizza',
                    description: 'Pepperoni, seasoned pork, beef, mushrooms, green bell peppers and red onions.',
                    price: 16.99,
                    category: 'Pizza',
                    restaurant: pizzaHut._id,
                    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                }
            );
        }

        const sushiMaster = findRest('Sushi');
        if (sushiMaster) {
            products.push(
                {
                    name: 'California Roll',
                    description: 'Crab meat, avocado, and cucumber.',
                    price: 8.99,
                    category: 'Sushi',
                    restaurant: sushiMaster._id,
                    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd43ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                },
                {
                    name: 'Spicy Tuna Roll',
                    description: 'Fresh tuna with spicy mayo and cucumber.',
                    price: 9.99,
                    category: 'Sushi',
                    restaurant: sushiMaster._id,
                    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                }
            );
        }

        await Product.create(products);
        res.status(201).json({ status: 'success', count: products.length, message: 'Products seeded successfully' });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);

        if (!product) {
            res.status(404).json({
                status: 'fail',
                message: 'Product not found',
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: {
                product,
            },
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;
        const product = await Product.findByIdAndUpdate(productId, req.body, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            res.status(404).json({
                status: 'fail',
                message: 'Product not found',
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: {
                product,
            },
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.params;
        const product = await Product.findByIdAndDelete(productId);

        if (!product) {
            res.status(404).json({
                status: 'fail',
                message: 'Product not found',
            });
            return;
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};
