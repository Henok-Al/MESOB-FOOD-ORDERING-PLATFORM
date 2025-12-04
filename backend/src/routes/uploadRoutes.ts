import express from 'express';
import { uploadImage, uploadMultipleImages, deleteImage } from '../controllers/uploadController';
import { upload } from '../middleware/upload';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/upload/image
// @desc    Upload a single image
// @access  Private
router.post('/image', upload.single('image'), uploadImage);

// @route   POST /api/upload/images
// @desc    Upload multiple images
// @access  Private
router.post('/images', upload.array('images', 10), uploadMultipleImages);

// @route   DELETE /api/upload/image
// @desc    Delete an image from Cloudinary
// @access  Private
router.delete('/image', deleteImage);

export default router;
