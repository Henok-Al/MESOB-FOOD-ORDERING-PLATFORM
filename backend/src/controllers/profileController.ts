import { Request, Response } from 'express';
import User from '../models/User';

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user!._id);
        res.status(200).json({
            status: 'success',
            data: { user },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Update current user profile
// @route   PUT /api/profile/me
// @access  Private
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { firstName, lastName, phone } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user!._id,
            { firstName, lastName, phone },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            status: 'success',
            data: { user },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Add address
// @route   POST /api/profile/addresses
// @access  Private
export const addAddress = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) {
            res.status(404).json({ status: 'fail', message: 'User not found' });
            return;
        }

        const { street, city, state, zipCode, isDefault } = req.body;

        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push({ street, city, state, zipCode, isDefault });
        await user.save();

        res.status(200).json({
            status: 'success',
            data: { user },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Delete address
// @route   DELETE /api/profile/addresses/:id
// @access  Private
export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) {
            res.status(404).json({ status: 'fail', message: 'User not found' });
            return;
        }

        user.addresses = user.addresses.filter(
            (addr: any) => addr._id.toString() !== req.params.id
        );
        await user.save();

        res.status(200).json({
            status: 'success',
            data: { user },
        });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};
