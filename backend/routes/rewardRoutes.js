import express from 'express';
import { getRewardBalance, redeemRewards } from '../controllers/loyaltyController.js';

const router = express.Router();

router.get('/balance/:userId', getRewardBalance);
router.post('/redeem', redeemRewards);

export default router;
