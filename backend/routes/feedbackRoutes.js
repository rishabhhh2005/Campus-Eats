import express from 'express';
import { submitFeedback, getFeedbacks } from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, submitFeedback);
router.get('/', getFeedbacks);

export default router;
