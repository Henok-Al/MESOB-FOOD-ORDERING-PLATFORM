import express from 'express';
import {
    getProfile,
    updateProfile,
    addAddress,
    deleteAddress,
} from '../controllers/profileController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/me')
    .get(getProfile)
    .put(updateProfile);

router.route('/addresses')
    .post(addAddress);

router.route('/addresses/:id')
    .delete(deleteAddress);

export default router;
