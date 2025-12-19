import { Router } from 'express';
import customerRoutes from './customer.routes';
import rmaRoutes from './rma.routes';

const router = Router();

// Mount route modules
router.use('/customers', customerRoutes);
router.use('/rmas', rmaRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
    });
});

export default router;
