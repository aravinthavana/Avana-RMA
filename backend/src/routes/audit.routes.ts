import { Router } from 'express';
import auditController from '../controllers/audit.controller';
import authMiddleware from '../middleware/auth.middleware';
import roleMiddleware from '../middleware/role.middleware';

const router = Router();

// Protect all audit routes - ADMIN ONLY
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

router.get('/', auditController.getAll);

export default router;
