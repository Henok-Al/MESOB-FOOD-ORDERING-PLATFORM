import express from 'express';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/uploadMiddleware';
import { uploadImage } from '../controllers/uploadController';

const router = express.Router();

router.post('/', protect, upload.single('image'), uploadImage);

export default router;
