import { Router } from 'express';
import notificationController from '../controllers/notification.controller';
import authMiddleware from '../middleware/auth.middleware';
import roleMiddleware from '../middleware/role.middleware';

const router = Router();

// All notification routes require authentication and ADMIN role
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

router.get('/', notificationController.getAll);
router.get('/unread', notificationController.getUnread);
router.get('/unread/count', notificationController.getUnreadCount);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.delete);

export default router;
