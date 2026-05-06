import { Router } from 'express';
import {
  getGuides,
  getGuideBySlug,
  createGuide,
  updateGuide,
  deleteGuide,
  publishGuide,
  compareGuides,
} from '../controllers/guide.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import authorize from '../middleware/rbac.middleware.js';

const router = Router();

// Public
router.get('/compare', compareGuides);
router.get('/', getGuides);
router.get('/:slug', getGuideBySlug);

// Verified creator
router.post('/', authMiddleware, authorize('verified', 'admin'), createGuide);
router.patch('/:id', authMiddleware, authorize('verified', 'admin'), updateGuide);
router.delete('/:id', authMiddleware, authorize('verified', 'admin'), deleteGuide);
router.post('/:id/publish', authMiddleware, authorize('verified', 'admin'), publishGuide);

export default router;
