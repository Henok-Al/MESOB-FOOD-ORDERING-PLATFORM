import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { Permission, hasPermission } from '../config/permissions';
import { UserRole } from '@food-ordering/constants';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

// Protect routes - Verify JWT and attach user to request
export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};

// Permission-based authorization middleware
export const requirePermission = (permission: Permission) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const userRole = req.user.role as UserRole;

        if (!hasPermission(userRole, permission)) {
            return res.status(403).json({
                success: false,
                message: `Permission denied. Required permission: ${permission}`,
            });
        }

        next();
    };
};

// Require specific role
export const requireRole = (role: UserRole) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(401).json({ status: 'fail', message: 'Not authenticated' });
            return;
        }

        if (req.user.role !== role) {
            res.status(403).json({ status: 'fail', message: 'Insufficient permissions' });
            return;
        }
        next();
    };
};

// Legacy role-based authorization (deprecated - use requirePermission or requireRole instead)
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`,
            });
        }
        next();
    };
};

// Resource ownership validation middleware
export const validateOwnership = (modelName: 'restaurant' | 'order' | 'product') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        // Admin bypass
        if (req.user.role === UserRole.ADMIN) {
            return next();
        }

        try {
            let resourceOwnerId;

            switch (modelName) {
                case 'restaurant':
                    // For restaurant routes, check if user owns the restaurant
                    const restaurantId = req.params.restaurantId || req.body.restaurant;
                    if (restaurantId) {
                        const Restaurant = (await import('../models/Restaurant')).default;
                        const restaurant = await Restaurant.findById(restaurantId);
                        if (!restaurant) {
                            return res.status(404).json({ success: false, message: 'Restaurant not found' });
                        }
                        resourceOwnerId = restaurant.owner?.toString();
                    }
                    break;

                case 'product':
                    // For product routes, check if user owns the parent restaurant
                    const productRestaurantId = req.params.restaurantId || req.body.restaurant;
                    if (productRestaurantId) {
                        const Restaurant = (await import('../models/Restaurant')).default;
                        const restaurant = await Restaurant.findById(productRestaurantId);
                        if (!restaurant) {
                            return res.status(404).json({ success: false, message: 'Restaurant not found' });
                        }
                        resourceOwnerId = restaurant.owner?.toString();
                    }
                    break;

                case 'order':
                    // For order routes, check if user owns the restaurant that the order belongs to
                    // This would require additional logic based on your schema
                    break;
            }

            if (resourceOwnerId && resourceOwnerId !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to access this resource',
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Ownership validation failed' });
        }
    };
};
