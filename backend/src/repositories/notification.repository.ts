import { PrismaClient, Notification } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationRepository {
    async findAll(limit: number = 50, offset: number = 0): Promise<Notification[]> {
        return await prisma.notification.findMany({
            take: limit,
            skip: offset,
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findUnread(): Promise<Notification[]> {
        return await prisma.notification.findMany({
            where: {
                isRead: false
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async getUnreadCount(): Promise<number> {
        return await prisma.notification.count({
            where: {
                isRead: false
            }
        });
    }

    async findById(id: string): Promise<Notification | null> {
        return await prisma.notification.findUnique({
            where: { id }
        });
    }

    async create(data: Pick<Notification, 'type' | 'message' | 'metadata'>): Promise<Notification> {
        return await prisma.notification.create({
            data
        });
    }

    async markAsRead(id: string): Promise<Notification> {
        return await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
    }

    async markAllAsRead(): Promise<number> {
        const result = await prisma.notification.updateMany({
            where: { isRead: false },
            data: { isRead: true }
        });
        return result.count;
    }

    async delete(id: string): Promise<Notification> {
        return await prisma.notification.delete({
            where: { id }
        });
    }
}

export default new NotificationRepository();
