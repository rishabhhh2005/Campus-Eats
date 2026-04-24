import express from 'express';
import { getCampuses } from '../controllers/campusController.js';

const router = express.Router();

router.get('/', getCampuses);

export default router;
