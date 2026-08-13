import { Router } from 'express';
import multer from 'multer';
import os from 'os';
import adminController from '../controllers/admin.controller';
import authMiddleware from '../middleware/auth.middleware';
import { auditMiddleware } from '../middleware/audit.middleware';
import { AuditAction, AuditEntity } from '../services/audit.service';

const router = Router();
const upload = multer({ dest: os.tmpdir() });

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

/**
 * @route   POST /api/admin/restore
 * @desc    Upload an SQL file to restore the database (Admin only)
 * @access  Private/Admin
 */
router.post(
    '/restore',
    upload.single('file'),
    auditMiddleware('RESTORE_BACKUP' as any, 'SYSTEM' as any),
    (req, res, next) => adminController.restoreDatabaseBackup(req, res, next)
);

export default router;
