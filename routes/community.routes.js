import { Router } from 'express';
import { getCommunities, createCommunity, joinCommunity, leaveCommunity } from '../controllers/community.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getCommunities);
router.post('/', authMiddleware, createCommunity);
router.post('/:id/join', authMiddleware, joinCommunity);
router.delete('/:id/leave', authMiddleware, leaveCommunity);

export default router;
