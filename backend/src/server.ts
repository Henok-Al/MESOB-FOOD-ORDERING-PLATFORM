import dotenv from 'dotenv';
dotenv.config();

import { httpServer } from './app';
import connectDB from './config/db';

const DEFAULT_PORT = parseInt(process.env.PORT || '5000', 10);
const RETRY_DELAY_MS = 500;

const startServer = (port: number) => {
    const onError = (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
            const nextPort = port + 1;
            console.warn(`⚠️ Port ${port} is already in use. Retrying on port ${nextPort}...`);
            setTimeout(() => startServer(nextPort), RETRY_DELAY_MS);
        } else {
            console.error(`❌ Server failed to start: ${error.message}`);
            process.exit(1);
        }
    };

    httpServer.once('error', onError);

    httpServer.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
    });
};

// Connect to Database
connectDB().then(() => {
    startServer(DEFAULT_PORT);
});
