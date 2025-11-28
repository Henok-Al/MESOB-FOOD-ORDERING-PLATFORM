import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import path from 'path';

// Load env vars from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedCustomers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);

        console.log('Connected to MongoDB...');

        // Sample customer data
        const customers = [
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Customer@123',
                role: 'customer' as const,
                phone: '+251911111111',
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                password: 'Customer@123',
                role: 'customer' as const,
                phone: '+251911111112',
            },
            {
                firstName: 'Bob',
                lastName: 'Johnson',
                email: 'bob.johnson@example.com',
                password: 'Customer@123',
                role: 'customer' as const,
                phone: '+251911111113',
            },
        ];

        // Check if customers already exist
        for (const customerData of customers) {
            const existingCustomer = await User.findOne({ email: customerData.email });

            if (existingCustomer) {
                console.log(`Customer ${customerData.email} already exists, skipping...`);
                continue;
            }

            await User.create(customerData);
            console.log(`✅ Created customer: ${customerData.email}`);
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: See individual emails above');
        console.log('🔑 Password: Customer@123 (for all)');
        console.log('👤 Role: customer');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding customers:', error);
        process.exit(1);
    }
};

seedCustomers();
