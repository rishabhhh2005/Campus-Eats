import express from 'express';
import { pickupByCode } from '../controllers/orderController.js';

const router = express.Router();

router.post('/by-code', pickupByCode);

export default router;
