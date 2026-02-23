import { Request, Response } from 'express';
import Address from '../models/Address';

// @desc    Get user's saved addresses
// @route   GET /api/addresses
// @access  Private
export const getMyAddresses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;

    const addresses = await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: addresses.length,
      data: { addresses },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get default address
// @route   GET /api/addresses/default
// @access  Private
export const getDefaultAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;

    const address = await Address.findOne({ user: userId, isDefault: true });

    if (!address) {
      res.status(404).json({ status: 'fail', message: 'No default address found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { address },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
export const createAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { isDefault, ...addressData } = req.body;

    // If this is set as default, unset other default addresses
    if (isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    const address = await Address.create({
      user: userId,
      ...addressData,
      isDefault: isDefault || false,
    });

    res.status(201).json({
      status: 'success',
      data: { address },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Update address
// @route   PATCH /api/addresses/:id
// @access  Private
export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;
    const { isDefault, ...updateData } = req.body;

    const address = await Address.findOne({ _id: id, user: userId });

    if (!address) {
      res.status(404).json({ status: 'fail', message: 'Address not found' });
      return;
    }

    // If setting as default, unset others
    if (isDefault) {
      await Address.updateMany({ user: userId, _id: { $ne: id } }, { isDefault: false });
    }

    Object.assign(address, updateData, { isDefault });
    await address.save();

    res.status(200).json({
      status: 'success',
      data: { address },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;

    const address = await Address.findOneAndDelete({ _id: id, user: userId });

    if (!address) {
      res.status(404).json({ status: 'fail', message: 'Address not found' });
      return;
    }

    res.status(204).json({ status: 'success', data: null });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Set address as default
// @route   PATCH /api/addresses/:id/set-default
// @access  Private
export const setDefaultAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;

    // Unset current default
    await Address.updateMany({ user: userId }, { isDefault: false });

    // Set new default
    const address = await Address.findOneAndUpdate(
      { _id: id, user: userId },
      { isDefault: true },
      { new: true }
    );

    if (!address) {
      res.status(404).json({ status: 'fail', message: 'Address not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { address },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};
