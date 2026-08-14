import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import authController from '../controllers/auth.controller';
import authMiddleware from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Configure Multer for signature uploads
const signatureStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(process.cwd(), 'uploads', 'signatures');
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
const uploadSignature = multer({ 
    storage: signatureStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// Stricter rate limiter for password reset to prevent abuse
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 requests per 15 minutes
    message: { success: false, error: 'Too many password reset attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Brute-force protection for login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 failed attempts across 15 min allowed per IP
    message: { success: false, error: 'Too many login attempts from this IP. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Only count FAILED requests
});

// Public routes
router.post('/signin', loginLimiter, authController.login);
router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', authMiddleware, authController.me);
router.post('/profile/signature', authMiddleware, uploadSignature.single('signature'), authController.uploadSignature);

export default router;
