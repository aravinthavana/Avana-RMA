import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify JWT token
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
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
