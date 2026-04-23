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

// Basic order operations
router.get('/all', getAllOrders);
router.get('/', protect, getUserOrders);
router.post('/', protect, createOrder);
router.delete('/:id', protect, deleteOrder);

// Status and Pickup operations
router.post('/:id/status', updateOrderStatus);
router.get('/:id/pickup-code', getPickupCode);

// These were originally /api/pickup/by-code and /api/accept/by-code
// I'll keep them consistent with the original API structure if I router.use('/api/orders', orderRoutes)
// But wait, the original was /api/pickup/by-code, not /api/orders/pickup/by-code.
// I'll handle /api/pickup and /api/accept separately or adjust server.js to map them.

export default router;
