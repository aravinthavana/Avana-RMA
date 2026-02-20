import { Router } from 'express';
import userController from '../controllers/user.controller';
import authMiddleware from '../middleware/auth.middleware';
import roleMiddleware from '../middleware/role.middleware';
import { auditMiddleware } from '../middleware/audit.middleware';
import { AuditAction, AuditEntity } from '../services/audit.service';

// All user routes should be protected and potentially admin-only
const router = Router();

// 1. Verify Token
router.use(authMiddleware);

// 2. Verify Role (ADMIN only for user management)
router.use(roleMiddleware(['ADMIN']));

router.get('/', userController.getAll);
router.get('/:id', userController.getById);

router.post('/', auditMiddleware(AuditAction.CREATE, AuditEntity.USER), userController.create);
router.put('/:id', auditMiddleware(AuditAction.UPDATE, AuditEntity.USER), userController.update);
router.delete('/:id', auditMiddleware(AuditAction.DELETE, AuditEntity.USER), userController.delete);
router.patch('/:id/status', auditMiddleware(AuditAction.UPDATE, AuditEntity.USER), userController.toggleStatus);
router.patch('/:id/reset-password', auditMiddleware(AuditAction.UPDATE, AuditEntity.USER), userController.resetPassword);

export default router;
