import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import authRepository from '../repositories/auth.repository';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

export class AuthService {
    private authRepo = authRepository;

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
            JWT_SECRET,
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
}

export default new AuthService();
