import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Restaurant from '../models/Restaurant';
import Product from '../models/Product';
import { UserRole } from '@food-ordering/constants';
import path from 'path';
import readline from 'readline';

// Load env vars from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

const seedAll = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);

        console.log('Connected to MongoDB...');
        console.log('\n⚠️  WARNING: This will clear ALL existing data!');

        const answer = await question('Do you want to continue? (yes/no): ');

        if (answer.toLowerCase() !== 'yes') {
            console.log('Seeding cancelled.');
            rl.close();
            process.exit(0);
        }

        rl.close();

        // Clear existing data
        console.log('\n🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Restaurant.deleteMany({});
        await Product.deleteMany({});
        console.log('✅ Existing data cleared');

        // Seed Admin
        console.log('\n👤 Creating Admin...');
        const admin = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@mesob.com',
            password: 'Admin@123',
            role: UserRole.ADMIN,
            phone: '+251911234567',
        });
        console.log(`✅ Admin created: ${admin.email}`);

        // Seed Restaurant Owner
        console.log('\n🏪 Creating Restaurant Owner...');
        const owner = await User.create({
            firstName: 'Restaurant',
            lastName: 'Owner',
            email: 'owner@mesob.com',
            password: 'Owner@123',
            role: UserRole.RESTAURANT_OWNER,
            phone: '+251911234568',
        });

        // Create Restaurant
        const restaurant = await Restaurant.create({
            name: 'Mesob Ethiopian Cuisine',
            description: 'Authentic Ethiopian food with traditional recipes',
            cuisine: 'Ethiopian',
            address: '123 Bole Road, Addis Ababa',
            rating: 4.8,
            imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
            deliveryTime: '30-45 min',
            minOrder: 50,
            isActive: true,
            status: 'approved',
            owner: owner._id,
            // New fields
            phone: '+251911234567',
            email: 'info@mesob.com',
            website: 'https://mesob.com',
            tags: ['Ethiopian', 'Vegetarian Friendly', 'Halal', 'Traditional'],
            isFeatured: true,
            viewCount: 0,
            hours: [
                { day: 'monday', openTime: '10:00', closeTime: '22:00', isClosed: false },
                { day: 'tuesday', openTime: '10:00', closeTime: '22:00', isClosed: false },
                { day: 'wednesday', openTime: '10:00', closeTime: '22:00', isClosed: false },
                { day: 'thursday', openTime: '10:00', closeTime: '22:00', isClosed: false },
                { day: 'friday', openTime: '10:00', closeTime: '23:00', isClosed: false },
                { day: 'saturday', openTime: '10:00', closeTime: '23:00', isClosed: false },
                { day: 'sunday', openTime: '11:00', closeTime: '21:00', isClosed: false },
            ],
            location: {
                type: 'Point',
                coordinates: [38.7469, 9.0320], // Addis Ababa coordinates [longitude, latitude]
            },
            socialMedia: {
                facebook: 'https://facebook.com/mesob',
                instagram: 'https://instagram.com/mesob',
                twitter: 'https://twitter.com/mesob',
            },
            gallery: [
                'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
                'https://images.unsplash.com/photo-1529042410759-befb1204b468',
                'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
            ],
        });
        console.log(`✅ Restaurant created: ${restaurant.name}`);

        // Create Sample Products
        console.log('\n🍽️  Creating Menu Items...');
        const products = await Product.create([
            {
                name: 'Doro Wot',
                description: 'Traditional Ethiopian chicken stew with berbere spice',
                price: 250,
                category: 'Main Course',
                imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468',
                restaurant: restaurant._id,
                isAvailable: true,
            },
            {
                name: 'Kitfo',
                description: 'Ethiopian steak tartare, minced raw beef with spices',
                price: 300,
                category: 'Main Course',
                imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
                restaurant: restaurant._id,
                isAvailable: true,
            },
            {
                name: 'Injera',
                description: 'Traditional Ethiopian sourdough flatbread',
                price: 50,
                category: 'Bread',
                imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff',
                restaurant: restaurant._id,
                isAvailable: true,
            },
            {
                name: 'Tibs',
                description: 'Sautéed meat with vegetables and spices',
                price: 280,
                category: 'Main Course',
                imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
                restaurant: restaurant._id,
                isAvailable: true,
            },
        ]);
        console.log(`✅ Created ${products.length} menu items`);

        // Seed Customers
        console.log('\n👥 Creating Customers...');
        const customers = await User.create([
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Customer@123',
                role: 'customer',
                phone: '+251911111111',
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                password: 'Customer@123',
                role: 'customer',
                phone: '+251911111112',
            },
            {
                firstName: 'Bob',
                lastName: 'Johnson',
                email: 'bob.johnson@example.com',
                password: 'Customer@123',
                role: 'customer',
                phone: '+251911111113',
            },
        ]);
        console.log(`✅ Created ${customers.length} customers`);

        // Seed Drivers
        console.log('\n🚗 Creating Drivers...');
        const drivers = await User.create([
            {
                firstName: 'Mike',
                lastName: 'Driver',
                email: 'mike.driver@mesob.com',
                password: 'Driver@123',
                role: 'driver',
                phone: '+251922222221',
            },
            {
                firstName: 'Sarah',
                lastName: 'Delivery',
                email: 'sarah.delivery@mesob.com',
                password: 'Driver@123',
                role: 'driver',
                phone: '+251922222222',
            },
        ]);
        console.log(`✅ Created ${drivers.length} drivers`);

        // Summary
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 DATABASE SEEDING COMPLETED!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n📊 Summary:');
        console.log(`   • 1 Admin`);
        console.log(`   • 1 Restaurant Owner with 1 Restaurant`);
        console.log(`   • ${products.length} Menu Items`);
        console.log(`   • ${customers.length} Customers`);
        console.log(`   • ${drivers.length} Drivers`);
        console.log('\n🔐 Login Credentials:');
        console.log('   Admin:       admin@mesob.com / Admin@123');
        console.log('   Owner:       owner@mesob.com / Owner@123');
        console.log('   Customer:    john.doe@example.com / Customer@123');
        console.log('   Driver:      mike.driver@mesob.com / Driver@123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        rl.close();
        process.exit(1);
    }
};

seedAll();
