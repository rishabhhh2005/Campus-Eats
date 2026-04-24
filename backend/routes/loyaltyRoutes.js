import express from 'express';
import { getLoyaltyStatus, getRewardBalance, redeemRewards } from '../controllers/loyaltyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All loyalty routes require authentication — userId is derived from JWT
router.get('/status',          protect, getLoyaltyStatus);   // GET  /api/loyalty/status
router.get('/rewards/balance', protect, getRewardBalance);   // GET  /api/loyalty/rewards/balance
router.post('/rewards/redeem', protect, redeemRewards);      // POST /api/loyalty/rewards/redeem

export default router;
