import express from 'express';
import {
  createGroupOrder,
  getGroupOrder,
  joinGroupOrder,
  addItemToGroupOrder,
  removeItemFromGroupOrder,
  markReady,
  placeGroupOrder,
  getMyGroupOrders,
  cancelGroupOrder,
} from '../controllers/groupOrderController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All group order routes require authentication
router.use(protect);

// Create and get my group orders
router.post('/', createGroupOrder);
router.get('/my-orders', getMyGroupOrders);

// Specific group order operations
router.get('/:groupOrderId', getGroupOrder);
router.post('/:groupOrderId/join', joinGroupOrder);
router.post('/:groupOrderId/items', addItemToGroupOrder);
router.delete('/:groupOrderId/items/:itemId', removeItemFromGroupOrder);
router.post('/:groupOrderId/ready', markReady);
router.post('/:groupOrderId/place', placeGroupOrder);
router.delete('/:groupOrderId', cancelGroupOrder);

export default router;
