import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export class UserRepository {
    async findAll(): Promise<User[]> {
        return await prisma.user.findMany();
    }

    async findById(id: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { id }
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { email }
        });
    }

    async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        return await prisma.user.create({
            data
        });
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        return await prisma.user.update({
            where: { id },
            data
        });
    }

    async delete(id: string): Promise<User> {
        return await prisma.user.delete({
            where: { id }
        });
    }
}

export default new UserRepository();
