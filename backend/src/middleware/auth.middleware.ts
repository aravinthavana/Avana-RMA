import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT token
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        // Server misconfiguration — never expose internal error to client
        console.error('CRITICAL: JWT_SECRET environment variable is not set!');
        return res.status(500).json({ success: false, error: 'Server configuration error' });
    }
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Check format "Bearer <token>"
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Invalid token format' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user info to request
        (req as any).user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
};

export default authMiddleware;
