import express from 'express';
import { getBalance, getTransactions, addMoney } from '../controllers/walletController.js';

const router = express.Router();

router.get('/balance/:userId', getBalance);
router.get('/transactions/:userId', getTransactions);
router.post('/add', addMoney);

export default router;
