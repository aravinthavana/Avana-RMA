import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import db from './database';
import logger from './logger';

// Load environment variables first
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Security: Add HTTP security headers
app.use(helmet());

const whitelist = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000'
];

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-side)
        if (!origin) {
            return callback(null, true);
        }
        // In development, also allow local network origins
        if (process.env.NODE_ENV !== 'production') {
            if (
                origin.includes('localhost') ||
                origin.includes('127.0.0.1') ||
                origin.includes('192.168.') ||
                origin.includes('10.')
            ) {
                return callback(null, true);
            }
        }
        // Always check the explicit whitelist (production domains)
        if (whitelist.includes(origin)) {
            return callback(null, true);
        }
        console.warn('Blocked CORS origin:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.options('*', cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// Rate limiting configuration
// General API rate limit: 100 requests per 15 minutes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limit for mutating operations (POST, PUT, DELETE)
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: 'Too many write operations from this IP, please try again later.',
});

// Apply general rate limiter to all API routes
app.use('/api/', apiLimiter);

// ====== NEW CLEAN ARCHITECTURE ROUTES ======
// Import new route modules
import routes from './routes';

// Mount new routes
app.use('/api', routes);

// Health check endpoint (used by Render to verify the service is alive)
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// ==========================================

// ====== NOTE: OLD MONOLITHIC CODE REMOVED ======
// Customer and RMA endpoints have been migrated to clean architecture:
// - Customer: src/routes/customer.routes.ts
// - RMA: src/routes/rma.routes.ts
// All database operations now use Prisma ORM
// ================================================

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error:', err);
    // SECURITY: Never expose internal stack traces in production
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(err.status || 500).json({
        success: false,
        error: 'Internal Server Error',
        message: isDev ? (err.message || 'Something went wrong') : 'Something went wrong',
        ...(isDev && { stack: err.stack }),
    });
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
