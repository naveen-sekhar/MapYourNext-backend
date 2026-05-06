import { Router } from 'express';
import { getReviews, createReview, deleteReview, markHelpful } from '../controllers/review.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.get('/:targetType/:targetId', getReviews);
router.post('/', authMiddleware, createReview);
router.delete('/:id', authMiddleware, deleteReview);
router.post('/:id/helpful', authMiddleware, markHelpful);

export default router;
