import { Request, Response } from 'express';
import User from '../models/User';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        // Pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // Build query
        const query: any = {};

        // Filter by role
        if (req.query.role) {
            query.role = req.query.role;
        }

        // Search by name or email
        if (req.query.search) {
            query.$or = [
                { firstName: { $regex: req.query.search, $options: 'i' } },
                { lastName: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
            ];
        }

        // Execute query
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin)
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            res.status(404).json({ status: 'fail', message: 'User not found' });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

// @desc    Update user
// @route   PATCH /api/users/:id
// @access  Private (Admin)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).select('-password');

        if (!user) {
            res.status(404).json({ status: 'fail', message: 'User not found' });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            res.status(404).json({ status: 'fail', message: 'User not found' });
            return;
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};
