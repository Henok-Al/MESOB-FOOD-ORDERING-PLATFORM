const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-ordering');
        console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

const dropDuplicateIndexes = async () => {
    try {
        const conn = await connectDB();
        
        // Drop the phone index
        try {
            await conn.connection.db.collection('users').dropIndex('phone_1');
            console.log('✅ Dropped phone_1 index');
        } catch (error) {
            console.log('ℹ️  Phone index not found or already dropped');
        }
        
        // Drop the duplicate stripePaymentIntentId index
        try {
            await conn.connection.db.collection('payments').dropIndex('stripePaymentIntentId_1');
            console.log('✅ Dropped stripePaymentIntentId_1 index');
        } catch (error) {
            console.log('ℹ️  StripePaymentIntentId index not found or already dropped');
        }
        
        // Close connection
        await mongoose.connection.close();
        console.log('✅ Connection closed');
    } catch (error) {
        console.error(`❌ Error dropping indexes: ${error.message}`);
        process.exit(1);
    }
};

dropDuplicateIndexes();