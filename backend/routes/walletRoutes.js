import express from 'express';
import { getBalance, getTransactions } from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All wallet routes require authentication — userId is derived from JWT
router.get('/balance',      protect, getBalance);       // GET /api/wallet/balance
router.get('/transactions', protect, getTransactions);  // GET /api/wallet/transactions

export default router;
