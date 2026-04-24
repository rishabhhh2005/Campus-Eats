import express from 'express';
import {
  getAllOrders,
  getUserOrders,
  createOrder,
  deleteOrder,
  updateOrderStatus,
  getPickupCode,
  pickupByCode,
  acceptByCode,
  hideOrderForVendor,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Order CRUD ────────────────────────────────────────────────────────────────
router.get('/',    protect, getUserOrders);   // GET  /api/orders        — user's orders
router.post('/',   protect, createOrder);     // POST /api/orders        — place order
router.delete('/:id', protect, deleteOrder);  // DEL  /api/orders/:id    — cancel order

// ── Order Status & Pickup Code ────────────────────────────────────────────────
router.patch('/:id/status',      updateOrderStatus); // PATCH /api/orders/:id/status
router.get('/:id/pickup-code',   getPickupCode);     // GET   /api/orders/:id/pickup-code

// ── Vendor Operations (no user auth — vendor-side scanning) ──────────────────
router.get('/all',           getAllOrders);   // GET  /api/orders/all
router.post('/pickup/verify', pickupByCode); // POST /api/orders/pickup/verify
router.post('/accept/verify', acceptByCode); // POST /api/orders/accept/verify
router.delete('/:id/hide',   hideOrderForVendor); // DELETE /api/orders/:id/hide

export default router;
