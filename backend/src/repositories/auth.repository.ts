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
}

export default new AuthRepository();
