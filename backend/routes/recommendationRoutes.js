import express from 'express';
import { getBestRatedToday, getTrending } from '../controllers/recommendationController.js';

const router = express.Router();

router.get('/recommendations/best-rated-today', getBestRatedToday);
router.get('/recommendations/trending', getTrending);

export default router;
