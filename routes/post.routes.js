import { Router } from 'express';
import { getPosts, createPost, getComments, addComment, upvotePost } from '../controllers/post.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getPosts);
router.post('/', authMiddleware, createPost);
router.get('/:id/comments', getComments);
router.post('/:id/comments', authMiddleware, addComment);
router.post('/:id/upvote', authMiddleware, upvotePost);

export default router;
