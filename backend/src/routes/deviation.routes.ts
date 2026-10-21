import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import deviationController from '../controllers/deviation.controller';
import authMiddleware from '../middleware/auth.middleware';
import { auditMiddleware } from '../middleware/audit.middleware';
import { AuditAction, AuditEntity } from '../services/audit.service';

const router = Router();

// Configure Multer for deviation attachments
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(process.cwd(), 'uploads', 'deviations');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const uploadAttachment = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Protect all deviation endpoints with JWT authentication
router.use(authMiddleware);

// Export to Excel (Must be declared before `/:id` route)
router.get('/export/excel', (req, res, next) => deviationController.exportExcel(req, res, next));

// Get next suggested deviation number
router.get('/next-number', (req, res, next) => deviationController.getNextNumber(req, res, next));

// Upload supporting document/attachment
router.post('/upload', uploadAttachment.single('file'), (req, res) => deviationController.uploadAttachment(req, res));

// Active signers list for deviation signature selection
router.get('/signers', (req, res, next) => deviationController.getSigners(req, res, next));

// List and Create
router.get('/', (req, res, next) => deviationController.getDeviations(req, res, next));
router.post('/', auditMiddleware(AuditAction.CREATE, AuditEntity.DEVIATION), (req, res, next) => deviationController.createDeviation(req, res, next));

// Single deviation CRUD & sign
router.get('/:id', (req, res, next) => deviationController.getDeviationById(req, res, next));
router.put('/:id', auditMiddleware(AuditAction.UPDATE, AuditEntity.DEVIATION), (req, res, next) => deviationController.updateDeviation(req, res, next));
router.delete('/:id', auditMiddleware(AuditAction.DELETE, AuditEntity.DEVIATION), (req, res, next) => deviationController.deleteDeviation(req, res, next));
router.patch('/:id/sign', auditMiddleware(AuditAction.UPDATE, AuditEntity.DEVIATION), (req, res, next) => deviationController.signDeviation(req, res, next));

export default router;
