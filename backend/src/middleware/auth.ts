import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Protect routes
export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }
    // else if (req.cookies.token) {
    //   // Set token from cookie
    //   token = req.cookies.token;
    // }

    // Make sure token exists
    if (!token) {
        return next(new Error('Not authorized to access this route'));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

        console.log(decoded);

        (req as any).user = await User.findById(decoded.id);

        next();
    } catch (err) {
        return next(new Error('Not authorized to access this route'));
    }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes((req as any).user.role)) {
            return next(
                new Error(`User role ${(req as any).user.role} is not authorized to access this route`)
            );
        }
        next();
    };
};
