import express from 'express';
import {
	getAllOrders,
	getUserOrders,
	createOrder,
	deleteOrder,
	updateOrderStatus,
	getPickupCode,
	pickupByCode,
	acceptByCode
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Order operations
router.get('/orders/all', getAllOrders);
router.get('/orders', protect, getUserOrders);
router.post('/orders', protect, createOrder);
router.delete('/orders/:id', protect, deleteOrder);
router.post('/orders/:id/status', updateOrderStatus);
router.get('/orders/:id/pickup-code', getPickupCode);

// Pickup and Accept operations
router.post('/pickup/by-code', pickupByCode);
router.post('/accept/by-code', acceptByCode);


export default router;
