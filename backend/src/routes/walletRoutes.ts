import express from 'express';
import {
    getWallet,
    addFunds,
    getTransactions,
    getPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    updateAutoRecharge,
    deductFromWallet,
} from '../controllers/walletController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All wallet routes require authentication
router.use(protect);

// Wallet balance and info
router.get('/', getWallet);
router.post('/add-funds', addFunds);
router.post('/deduct', deductFromWallet);

// Transaction history
router.get('/transactions', getTransactions);

// Payment methods
router.get('/payment-methods', getPaymentMethods);
router.post('/payment-methods', addPaymentMethod);
router.patch('/payment-methods/:id', updatePaymentMethod);
router.delete('/payment-methods/:id', deletePaymentMethod);
router.post('/payment-methods/:id/default', setDefaultPaymentMethod);

// Auto-recharge settings
router.patch('/auto-recharge', updateAutoRecharge);

export default router;
