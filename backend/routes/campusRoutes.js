import express from 'express';
import { getCampuses, getCampusById } from '../controllers/campusController.js';

const router = express.Router();

router.get('/', getCampuses);
router.get('/:id', getCampusById);

export default router;
