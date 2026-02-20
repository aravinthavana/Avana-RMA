import { Request, Response, NextFunction } from 'express';
import { auditService, AuditAction } from '../services/audit.service';

/**
 * Middleware to log specific actions
 * Usage: app.post('/api/rmas', auditMiddleware(AuditAction.CREATE, 'RMA'), createRmaController);
 */
export const auditMiddleware = (action: string, entity: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Intercept response to log only on success, or log attempt? 
        // Typically we want to log the RESULT.
        // For simplicity, we can log "Success" after the handler returns, 
        // but since handlers usually send response, we might need to hook into response 'finish' event
        // OR simply log "Attempt" before, and if complex, log "Success" in the controller.

        // Strategy: Log that the action was performed by the user. 
        // This middleware assumes it runs AFTER authMiddleware, so req.user exists.

        const originalJson = res.json;

        // Override res.json to capture the response body if needed, or just status code
        res.on('finish', () => {
            // Only log successful operations (2xx codes) or 401/403 failures if needed
            // For now, let's log everything that matched the route
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const user = (req as any).user;
                if (user && user.userId) {
                    auditService.log({
                        userId: user.userId,
                        action,
                        entity,
                        entityId: req.params.id || (res.locals && res.locals.entityId), // How to get ID?
                        details: {
                            method: req.method,
                            url: req.originalUrl,
                            statusCode: res.statusCode
                        },
                        ipAddress: req.ip || req.socket.remoteAddress
                    });
                }
            }
        });

        next();
    };
};
