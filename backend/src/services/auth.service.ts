import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '@prisma/client';
import authRepository from '../repositories/auth.repository';
import notificationService from './notification.service';
import { validatePassword } from '../utils/validation';

const JWT_EXPIRES_IN = '2h'; // Reduced from 24h

export class AuthService {
    private authRepo = authRepository;

    /**
     * Get JWT_SECRET with validation
     */
    private getJwtSecret(): string {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('CRITICAL: JWT_SECRET environment variable must be set in .env file');
        }
        return secret;
    }

    /**
     * Validate user credentials and return token + user info
     */
    async login(email: string, password: string): Promise<{ token: string; user: Omit<User, 'password'> }> {
        // Find user by email
        const user = await this.authRepo.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Generate token
        const token = this.generateToken(user);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return {
            token,
            user: userWithoutPassword,
        };
    }

    /**
     * Generate JWT token
     */
    private generateToken(user: User): string {
        return jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            this.getJwtSecret(),
            { expiresIn: JWT_EXPIRES_IN }
        );
    }

    /**
     * Hash password
     */
    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    /**
     * Create initial admin user (used by seed script)
     */
    async createAdmin(data: any): Promise<User> {
        const hashedPassword = await this.hashPassword(data.password);
        return await this.authRepo.create({
            ...data,
            password: hashedPassword,
        });
    }

    /**
     * Initiate password reset
     */
    async forgotPassword(email: string): Promise<void> {
        const user = await this.authRepo.findByEmail(email);
        if (!user) {
            // For security: Don't reveal if user exists or not
            // Silently fail but don't throw error
            return;
        }

        // Generate cryptographically secure random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Save to DB
        await this.authRepo.update(user.id, {
            resetToken,
            resetTokenExpiry
        });

        // Create notification for admin
        await notificationService.createNotification(
            'PASSWORD_RESET_REQUEST',
            `Password reset requested for ${user.name} (${email})`,
            JSON.stringify({
                email,
                userName: user.name,
                resetToken,
                resetUrl: `http://localhost:5173/reset-password?token=${resetToken}`,
                timestamp: new Date().toISOString()
            })
        );
    }

    /**
     * Complete password reset
     */
    async resetPassword(token: string, newPassword: string): Promise<User> {
        const user = await this.authRepo.findByResetToken(token);

        if (!user) {
            throw new Error('Invalid or expired password reset token');
        }

        if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
            throw new Error('Invalid or expired password reset token');
        }

        // Validate password strength
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.errors.join(', '));
        }

        const hashedPassword = await this.hashPassword(newPassword);

        // Update user
        const updatedUser = await this.authRepo.update(user.id, {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null
        });

        return updatedUser;
    }
}

export default new AuthService();
