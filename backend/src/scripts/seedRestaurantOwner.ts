import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Restaurant from '../models/Restaurant';
import { Role } from '../config/permissions';
import path from 'path';

// Load env vars from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedRestaurantOwner = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);

        console.log('Connected to MongoDB...');

        // Check if restaurant owner already exists
        const existingOwner = await User.findOne({ email: 'owner@mesob.com' });

        if (existingOwner) {
            console.log('Restaurant owner already exists!');
            console.log('Email: owner@mesob.com');
            process.exit(0);
        }

        // Create restaurant owner user
        const owner = await User.create({
            firstName: 'Restaurant',
            lastName: 'Owner',
            email: 'owner@mesob.com',
            password: 'Owner@123',
            role: Role.RESTAURANT_OWNER,
            phone: '+251911234568'
        });

        // Create a sample restaurant for this owner
        const restaurant = await Restaurant.create({
            name: 'Test Restaurant',
            description: 'A sample restaurant for testing',
            address: '123 Main St, Addis Ababa',
            rating: 4.5,
            imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
            deliveryTime: '30-45 min',
            minOrder: 10,
            isActive: true,
            owner: owner._id
        });

        console.log('✅ Restaurant owner created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: owner@mesob.com');
        console.log('🔑 Password: Owner@123');
        console.log('👤 Role:', owner.role);
        console.log('🏪 Restaurant:', restaurant.name);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding restaurant owner:', error);
        process.exit(1);
    }
};

seedRestaurantOwner();
