import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import authMiddleware from '../middleware/auth.middleware';
import { auditMiddleware } from '../middleware/audit.middleware';
import { AuditAction, AuditEntity } from '../services/audit.service';

const router = Router();

// Protect all routes
router.use(authMiddleware);

/**
 * @route   GET /api/admin/backup
 * @desc    Download a PostgreSQL database backup (Admin only)
 * @access  Private/Admin
 */
router.get(
    '/backup',
    auditMiddleware('DOWNLOAD_BACKUP' as any, 'SYSTEM' as any),
    (req, res, next) => adminController.downloadDatabaseBackup(req, res, next)
);

export default router;
