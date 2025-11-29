import dotenv from 'dotenv';
dotenv.config();

import { httpServer } from './app';
import connectDB from './config/db';

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(() => {
    // Start Server
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});
