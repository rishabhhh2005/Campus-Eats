import express from 'express';
import { acceptByCode } from '../controllers/orderController.js';

const router = express.Router();

router.post('/by-code', acceptByCode);

export default router;
