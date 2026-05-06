import { Router } from 'express';
import { getNotifications, markAllRead } from '../controllers/notification.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/', getNotifications);
router.patch('/read-all', markAllRead);

export default router;
