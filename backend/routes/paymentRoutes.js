import express from 'express';
import { createRazorpayOrder, verifyPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/payment/create-order', createRazorpayOrder);
router.post('/payment/verify', verifyPayment);

export default router;
