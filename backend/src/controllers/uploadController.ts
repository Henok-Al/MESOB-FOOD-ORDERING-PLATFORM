import { Request, Response } from 'express';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({
                status: 'fail',
                message: 'No image file provided',
            });
            return;
        }

        const imageUrl = await uploadToCloudinary(req.file.buffer);

        res.status(200).json({
            status: 'success',
            data: {
                imageUrl,
            },
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to upload image',
        });
    }
};
