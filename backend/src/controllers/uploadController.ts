import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import streamifier from 'streamifier';

/**
 * Upload a single image to Cloudinary
 */
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({
                status: 'fail',
                message: 'No file uploaded',
            });
            return;
        }

        // Get the folder from query params or use default
        const folder = (req.query.folder as string) || 'mesob-food-ordering';

        // Upload to Cloudinary using a stream
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                transformation: [
                    { width: 1000, height: 1000, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' },
                ],
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    res.status(500).json({
                        status: 'fail',
                        message: 'Error uploading image to Cloudinary',
                        error: error.message,
                    });
                    return;
                }

                res.status(200).json({
                    status: 'success',
                    data: {
                        url: result?.secure_url,
                        publicId: result?.public_id,
                        width: result?.width,
                        height: result?.height,
                        format: result?.format,
                    },
                });
            }
        );

        // Convert buffer to stream and pipe to Cloudinary
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({
            status: 'fail',
            message: error.message,
        });
    }
};

/**
 * Upload multiple images to Cloudinary
 */
export const uploadMultipleImages = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            res.status(400).json({
                status: 'fail',
                message: 'No files uploaded',
            });
            return;
        }

        const folder = (req.query.folder as string) || 'mesob-food-ordering';
        const uploadPromises: Promise<any>[] = [];

        req.files.forEach((file: Express.Multer.File) => {
            const uploadPromise = new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder,
                        resource_type: 'image',
                        transformation: [
                            { width: 1000, height: 1000, crop: 'limit' },
                            { quality: 'auto' },
                            { fetch_format: 'auto' },
                        ],
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve({
                                url: result?.secure_url,
                                publicId: result?.public_id,
                                width: result?.width,
                                height: result?.height,
                                format: result?.format,
                            });
                        }
                    }
                );

                streamifier.createReadStream(file.buffer).pipe(uploadStream);
            });

            uploadPromises.push(uploadPromise);
        });

        const results = await Promise.all(uploadPromises);

        res.status(200).json({
            status: 'success',
            data: {
                images: results,
            },
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({
            status: 'fail',
            message: error.message,
        });
    }
};

/**
 * Delete an image from Cloudinary
 */
export const deleteImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { publicId } = req.body;

        if (!publicId) {
            res.status(400).json({
                status: 'fail',
                message: 'Public ID is required',
            });
            return;
        }

        const result = await cloudinary.uploader.destroy(publicId);

        res.status(200).json({
            status: 'success',
            data: result,
        });
    } catch (error: any) {
        console.error('Delete error:', error);
        res.status(500).json({
            status: 'fail',
            message: error.message,
        });
    }
};
