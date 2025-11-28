import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import path from 'path';

// Load env vars from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedDrivers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);

        console.log('Connected to MongoDB...');

        // Sample driver data
        const drivers = [
            {
                firstName: 'Mike',
                lastName: 'Driver',
                email: 'mike.driver@mesob.com',
                password: 'Driver@123',
                role: 'driver' as const,
                phone: '+251922222221',
            },
            {
                firstName: 'Sarah',
                lastName: 'Delivery',
                email: 'sarah.delivery@mesob.com',
                password: 'Driver@123',
                role: 'driver' as const,
                phone: '+251922222222',
            },
            {
                firstName: 'David',
                lastName: 'Express',
                email: 'david.express@mesob.com',
                password: 'Driver@123',
                role: 'driver' as const,
                phone: '+251922222223',
            },
        ];

        // Check if drivers already exist
        for (const driverData of drivers) {
            const existingDriver = await User.findOne({ email: driverData.email });

            if (existingDriver) {
                console.log(`Driver ${driverData.email} already exists, skipping...`);
                continue;
            }

            await User.create(driverData);
            console.log(`✅ Created driver: ${driverData.email}`);
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: See individual emails above');
        console.log('🔑 Password: Driver@123 (for all)');
        console.log('👤 Role: driver');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding drivers:', error);
        process.exit(1);
    }
};

seedDrivers();
