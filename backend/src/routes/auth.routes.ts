import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import authController from '../controllers/auth.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

// Stricter rate limiter for password reset to prevent abuse
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 requests per 15 minutes
    message: { success: false, error: 'Too many password reset attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Public routes
router.post('/signin', authController.login);
router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', authMiddleware, authController.me);

export default router;
