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

const dropPhoneIndex = async () => {
    try {
        const conn = await connectDB();
        
        // Drop the phone index
        await conn.connection.db.collection('users').dropIndex('phone_1');
        console.log('✅ Dropped phone_1 index');
        
        // Close connection
        await mongoose.connection.close();
        console.log('✅ Connection closed');
    } catch (error) {
        console.error(`❌ Error dropping index: ${error.message}`);
        process.exit(1);
    }
};

dropPhoneIndex();