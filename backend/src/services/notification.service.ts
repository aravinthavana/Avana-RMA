import { Notification } from '@prisma/client';
import notificationRepository from '../repositories/notification.repository';

export class NotificationService {
    private notificationRepo = notificationRepository;

    async getAllNotifications(limit: number = 50, offset: number = 0): Promise<Notification[]> {
        return await this.notificationRepo.findAll(limit, offset);
    }

    async getUnreadNotifications(): Promise<Notification[]> {
        return await this.notificationRepo.findUnread();
    }

    async getUnreadCount(): Promise<number> {
        return await this.notificationRepo.getUnreadCount();
    }

    async createNotification(type: string, message: string, metadata?: string): Promise<Notification> {
        return await this.notificationRepo.create({
            type,
            message,
            metadata: metadata || null
        });
    }

    async markAsRead(id: string): Promise<Notification> {
        return await this.notificationRepo.markAsRead(id);
    }

    async markAllAsRead(): Promise<number> {
        return await this.notificationRepo.markAllAsRead();
    }

    async deleteNotification(id: string): Promise<Notification> {
        return await this.notificationRepo.delete(id);
    }
}

export default new NotificationService();
