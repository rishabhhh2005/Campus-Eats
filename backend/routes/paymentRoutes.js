import express from 'express';
import { createRazorpayOrder, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-order', protect, createRazorpayOrder); // POST /api/payment/create-order
router.post('/verify',       protect, verifyPayment);       // POST /api/payment/verify

export default router;
