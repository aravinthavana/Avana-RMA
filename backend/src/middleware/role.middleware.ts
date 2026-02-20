import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user has required role
 * Must be placed AFTER authMiddleware so req.user is populated
 */
export const roleMiddleware = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!user) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ success: false, error: 'Access denied: Insufficient permissions' });
        }

        next();
    };
};

export default roleMiddleware;
