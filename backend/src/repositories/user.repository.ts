import { User } from '@prisma/client';
import prisma from '../lib/prisma';


export class UserRepository {
    async findAll(): Promise<User[]> {
        return await prisma.user.findMany({
            where: { isDeleted: false }
        });
    }

    async findById(id: string): Promise<User | null> {
        return await prisma.user.findFirst({
            where: { id, isDeleted: false }
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await prisma.user.findFirst({
            where: { email, isDeleted: false }
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
        return await prisma.user.update({
            where: { id },
            data: { isDeleted: true, isActive: false }
        });
    }
}

export default new UserRepository();
