import { Router } from 'express';
import userController from '../controllers/user.controller';
import authMiddleware from '../middleware/auth.middleware';
import roleMiddleware from '../middleware/role.middleware';
import { auditMiddleware } from '../middleware/audit.middleware';
import { AuditAction, AuditEntity } from '../services/audit.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Configure Multer for profile picture uploads
const profilePicStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(process.cwd(), 'uploads', 'profiles');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const uploadProfilePic = multer({ 
    storage: profilePicStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

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

// Profile Picture routes (Admin only)
router.post('/:id/profile-picture', uploadProfilePic.single('profilePicture'), auditMiddleware(AuditAction.UPDATE, AuditEntity.USER), userController.uploadProfilePicture);
router.delete('/:id/profile-picture', auditMiddleware(AuditAction.UPDATE, AuditEntity.USER), userController.removeProfilePicture);

export default router;
