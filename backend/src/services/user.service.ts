import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import userRepository from '../repositories/user.repository';
import { validatePassword } from '../utils/validation';

export class UserService {
    private userRepository = userRepository;

    async getAllUsers(): Promise<Omit<User, 'password'>[]> {
        const users = await this.userRepository.findAll();
        return users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }

    async getUserById(id: string): Promise<User | null> {
        return await this.userRepository.findById(id);
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findByEmail(email);
    }

    async createUser(data: any): Promise<User> {
        // Validate password strength
        const passwordValidation = validatePassword(data.password);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.errors.join(', '));
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        return await this.userRepository.create({
            ...data,
            password: hashedPassword,
            isActive: data.isActive ?? true,
            role: data.role ?? 'ADMIN'
        });
    }

    async updateUser(id: string, data: any): Promise<User> {
        // If password is being updated, hash it
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        }

        return await this.userRepository.update(id, data);
    }

    async deactivateUser(id: string): Promise<User> {
        return await this.userRepository.update(id, { isActive: false });
    }

    async reactivateUser(id: string): Promise<User> {
        return await this.userRepository.update(id, { isActive: true });
    }

    async deleteUser(id: string): Promise<User> {
        return await this.userRepository.delete(id);
    }

    async resetUserPassword(id: string, newPassword: string): Promise<User> {
        // Validate password strength
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.errors.join(', '));
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        return await this.userRepository.update(id, { password: hashedPassword });
    }

    async getAdminCount(): Promise<number> {
        const users = await this.userRepository.findAll();
        return users.filter(u => u.role === 'ADMIN').length;
    }
}

export default new UserService();
