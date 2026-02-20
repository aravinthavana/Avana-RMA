import { Router } from 'express';
import customerRoutes from './customer.routes';
import rmaRoutes from './rma.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import notificationRoutes from './notification.routes';
import auditRoutes from './audit.routes';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/rmas', rmaRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit', auditRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
    });
});

export default router;
