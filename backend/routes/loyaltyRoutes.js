import express from 'express';
import { getLoyaltyStatus, getRewardBalance, redeemRewards } from '../controllers/loyaltyController.js';

const router = express.Router();

// Loyalty Status
router.get('/loyalty/status/:userId', getLoyaltyStatus);

// Rewards
router.get('/rewards/balance/:userId', getRewardBalance);
router.post('/rewards/redeem', redeemRewards);


export default router;
