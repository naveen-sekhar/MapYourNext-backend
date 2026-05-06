import { Router } from 'express';
import {
  applyAsCreator,
  getApplications,
  reviewApplication,
} from '../controllers/creatorApplication.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import authorize from '../middleware/rbac.middleware.js';

const router = Router();

router.post('/', authMiddleware, applyAsCreator);
router.get('/', authMiddleware, authorize('admin'), getApplications);
router.patch('/:id', authMiddleware, authorize('admin'), reviewApplication);

export default router;
