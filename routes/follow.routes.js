import { Router } from 'express';
import { followUser, unfollowUser, getFollowers, getFollowing } from '../controllers/follow.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.post('/:userId', authMiddleware, followUser);
router.delete('/:userId', authMiddleware, unfollowUser);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

export default router;
