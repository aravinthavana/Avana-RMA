import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';

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
}

export default new AuthController();
