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

export default router;
