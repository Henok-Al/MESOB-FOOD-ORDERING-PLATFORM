const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * @param {string} uri - MongoDB connection URI
 * @returns {Promise} - Mongoose connection promise
 */
const connectDatabase = async (uri = process.env.MONGODB_URI) => {
    try {
        const options = {
            maxPoolSize: 10,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(uri, options);

        console.log(`✅ MongoDB connected successfully to: ${mongoose.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', err => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });

        return mongoose.connection;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise}
 */
const disconnectDatabase = async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }
};

module.exports = {
    connectDatabase,
    disconnectDatabase,
};
