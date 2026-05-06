import { Router } from 'express';
import { getTrips, createTrip, updateTrip, deleteTrip } from '../controllers/trip.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware); // All trip routes require auth

router.get('/', getTrips);
router.post('/', createTrip);
router.patch('/:id', updateTrip);
router.delete('/:id', deleteTrip);

export default router;
