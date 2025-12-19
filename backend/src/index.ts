import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import db from './database';
import logger from './logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const whitelist = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000'
];

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // In development, allow all localhost origins
        if (!origin || origin.includes('localhost') || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
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
// ==========================================

// ====== NOTE: OLD MONOLITHIC CODE REMOVED ======
// Customer and RMA endpoints have been migrated to clean architecture:
// - Customer: src/routes/customer.routes.ts
// - RMA: src/routes/rma.routes.ts
// All database operations now use Prisma ORM
// ================================================

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
