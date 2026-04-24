import express from 'express';
import { getBalance, getTransactions } from '../controllers/walletController.js';

const router = express.Router();

router.get('/umoney/balance/:userId', getBalance);
router.get('/umoney/transactions/:userId', getTransactions);

export default router;
