import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { Role } from '../config/permissions';
import path from 'path';

// Load env vars from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);

        console.log('Connected to MongoDB...');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@mesob.com' });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: admin@mesob.com');
            console.log('Role:', existingAdmin.role);
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@mesob.com',
            password: 'Admin@123', // Password will be hashed by pre-save hook
            role: Role.ADMIN,
            phone: '+251911234567'
        });

        console.log('✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: admin@mesob.com');
        console.log('🔑 Password: Admin@123');
        console.log('👤 Role:', admin.role);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
