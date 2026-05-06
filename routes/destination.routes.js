import { Router } from 'express';
import {
  getDestinations,
  getDestinationBySlug,
  createDestination,
  updateDestination,
  deleteDestination,
  getMapDestinations,
  getNearbyDestinations,
} from '../controllers/destination.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import authorize from '../middleware/rbac.middleware.js';

const router = Router();

// Public
router.get('/map', getMapDestinations);
router.get('/nearby', getNearbyDestinations);
router.get('/', getDestinations);
router.get('/:slug', getDestinationBySlug);

// Admin / Verified
router.post('/', authMiddleware, authorize('admin'), createDestination);
router.patch('/:id', authMiddleware, authorize('admin', 'verified'), updateDestination);
router.delete('/:id', authMiddleware, authorize('admin'), deleteDestination);

export default router;
