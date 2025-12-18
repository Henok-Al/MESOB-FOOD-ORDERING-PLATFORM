import { Request, Response } from 'express';
import Category from '../models/Category';

export const listCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const { restaurantId } = req.params;
        const categories = await Category.find({ restaurant: restaurantId }).sort({ name: 1 });
        res.status(200).json({ status: 'success', data: { categories } });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { restaurantId } = req.params;
        const category = await Category.create({ ...req.body, restaurant: restaurantId });
        res.status(201).json({ status: 'success', data: { category } });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!category) {
            res.status(404).json({ status: 'fail', message: 'Category not found' });
            return;
        }
        res.status(200).json({ status: 'success', data: { category } });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            res.status(404).json({ status: 'fail', message: 'Category not found' });
            return;
        }
        res.status(204).json({ status: 'success', data: null });
    } catch (error: any) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};
