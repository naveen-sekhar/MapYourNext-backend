import { Router } from 'express';
import {
  updateProfile,
  saveQuizAnswers,
  addToWishlist,
  removeFromWishlist,
  addToVisited,
  getUserProfile,
  searchUsers,
  getUsers,
  updateUserRole,
} from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import authorize from '../middleware/rbac.middleware.js';

const router = Router();

// Public
router.get('/search', searchUsers);
router.get('/:id/profile', getUserProfile);

// Authenticated
router.patch('/me', authMiddleware, updateProfile);
router.post('/quiz', authMiddleware, saveQuizAnswers);
router.post('/wishlist/:id', authMiddleware, addToWishlist);
router.delete('/wishlist/:id', authMiddleware, removeFromWishlist);
router.post('/visited/:id', authMiddleware, addToVisited);

// Admin
router.get('/', authMiddleware, authorize('admin'), getUsers);
router.patch('/:id/role', authMiddleware, authorize('admin'), updateUserRole);

export default router;
