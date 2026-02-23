import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes';
import restaurantRoutes from './routes/restaurantRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import userRoutes from './routes/userRoutes';
import profileRoutes from './routes/profileRoutes';
import reviewRoutes from './routes/reviewRoutes';
import notificationRoutes from './routes/notificationRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import uploadRoutes from './routes/uploadRoutes';
import categoryRoutes from './routes/categoryRoutes';
import driverRoutes from './routes/driverRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import couponRoutes from './routes/couponRoutes';
import loyaltyRoutes from './routes/loyaltyRoutes';
import addressRoutes from './routes/addressRoutes';
import tipRoutes from './routes/tipRoutes';
import adminRoutes from './routes/adminRoutes';
import trackingRoutes from './routes/trackingRoutes';
import walletRoutes from './routes/walletRoutes';
import groupOrderRoutes from './routes/groupOrderRoutes';
import { seedProducts } from './controllers/productController';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST']
    }
});

// Store io instance for access in controllers
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/restaurants/:restaurantId/categories', categoryRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/tips', tipRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/group-orders', groupOrderRoutes);

// Nest products under restaurants
// Note: In a real app, we'd mount this in restaurantRoutes.js, but for simplicity:
app.use('/api/restaurants/:restaurantId/products', productRoutes);

// Seeding endpoint for products
app.post('/api/products/seed', seedProducts);

// Socket.io connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user-specific room
    socket.on('join', (userId: string) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
    });

    // Join restaurant-specific room
    socket.on('joinRestaurant', (restaurantId: string) => {
        socket.join(`restaurant-${restaurantId}`);
        console.log(`Restaurant ${restaurantId} dashboard joined`);
    });

    // Join order-specific room for live tracking
    socket.on('joinOrder', (orderId: string) => {
        socket.join(`order-${orderId}`);
        console.log(`Client joined order room: ${orderId}`);
    });

    // Leave order room
    socket.on('leaveOrder', (orderId: string) => {
        socket.leave(`order-${orderId}`);
        console.log(`Client left order room: ${orderId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

export { app, httpServer, io };
