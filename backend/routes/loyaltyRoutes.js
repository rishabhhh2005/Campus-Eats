import express from 'express';
import { getLoyaltyStatus } from '../controllers/loyaltyController.js';

const router = express.Router();

router.get('/status/:userId', getLoyaltyStatus);

export default router;
