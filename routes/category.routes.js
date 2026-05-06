import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import authorize from '../middleware/rbac.middleware.js';

const router = Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', authMiddleware, authorize('admin'), createCategory);
router.patch('/:id', authMiddleware, authorize('admin'), updateCategory);
router.delete('/:id', authMiddleware, authorize('admin'), deleteCategory);

export default router;
