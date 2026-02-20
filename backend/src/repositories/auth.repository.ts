import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthRepository {
    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { email },
        });
    }

    /**
     * Find user by ID
     */
    async findById(id: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { id },
        });
    }

    /**
     * Create a new user
     */
    async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        return await prisma.user.create({
            data,
        });
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        return await prisma.user.update({
            where: { id },
            data,
        });
    }

    async findByResetToken(token: string): Promise<User | null> {
        return await prisma.user.findFirst({
            where: { resetToken: token },
        });
    }
}

export default new AuthRepository();
