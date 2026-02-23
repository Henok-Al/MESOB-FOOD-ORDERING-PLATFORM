import express from 'express';
import {
  getMyAddresses,
  getDefaultAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/addressController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', getMyAddresses);
router.get('/default', getDefaultAddress);
router.post('/', createAddress);
router.patch('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.patch('/:id/set-default', setDefaultAddress);

export default router;
