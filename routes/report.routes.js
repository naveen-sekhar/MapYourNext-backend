import { Router } from 'express';
import { getReports, createReport, resolveReport } from '../controllers/report.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import authorize from '../middleware/rbac.middleware.js';

const router = Router();

router.post('/', authMiddleware, createReport);
router.get('/', authMiddleware, authorize('moderator', 'admin'), getReports);
router.patch('/:id', authMiddleware, authorize('moderator', 'admin'), resolveReport);

export default router;
