import express from 'express';
import { getCampuses } from '../controllers/campusController.js';

const router = express.Router();

router.get('/campuses', getCampuses);

export default router;
