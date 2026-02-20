import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { auditService, AuditAction, AuditEntity } from '../services/audit.service';
import notificationService from '../services/notification.service';
import userService from '../services/user.service';

export class AuthController {
    private authService = authService;

    /**
     * Login user
     */
    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }

            const result = await this.authService.login(email, password);

            // Audit Log
            if (result && result.user) {
                await auditService.log({
                    userId: result.user.id,
                    action: AuditAction.LOGIN,
                    entity: AuditEntity.USER,
                    entityId: result.user.id,
                    details: { email },
                    ipAddress: req.ip
                });
            }

            res.json({
                success: true,
                message: 'Login successful',
                data: result
            });
        } catch (error) {
            // Check for specific auth errors (invalid credentials)
            if (error instanceof Error && error.message === 'Invalid email or password') {
                res.status(401).json({ success: false, error: 'Invalid email or password' });
            } else {
                next(error);
            }
        }
    };

    /**
     * Get current user profile (protected route test)
     */
    me = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // req.user is set by authMiddleware
            const user = (req as any).user;

            if (!user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    };

    forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ error: 'Email is required' });
                return;
            }

            await this.authService.forgotPassword(email);

            // Notify Admins
            try {
                // Fetch user to get details for the notification
                const user = await userService.findByEmail(email);

                if (user) {
                    await notificationService.createNotification(
                        'PASSWORD_RESET',
                        `User ${user.name} (${user.email}) requested a password reset.`,
                        JSON.stringify({ userId: user.id, email: user.email })
                    );
                }
            } catch (error) {
                console.error('Failed to create notification', error);
            }

            res.json({
                success: true,
                message: 'If the email exists, a password reset link has been sent.'
            });
        } catch (error) {
            next(error);
        }
    };

    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                res.status(400).json({ error: 'Token and new password are required' });
                return;
            }

            const user = await this.authService.resetPassword(token, newPassword);

            res.json({
                success: true,
                message: 'Password reset successful.',
                data: {
                    email: user.email,
                    name: user.name
                }
            });
        } catch (error) {
            next(error);
        }
    };
}

export default new AuthController();
