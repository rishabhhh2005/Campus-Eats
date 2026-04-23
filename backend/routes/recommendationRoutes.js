import express from 'express';
import { getBestRatedToday, getTrending } from '../controllers/recommendationController.js';

const router = express.Router();

router.get('/best-rated-today', getBestRatedToday);
router.get('/trending', getTrending);

export default router;
