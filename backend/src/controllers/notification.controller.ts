import { Request, Response, NextFunction } from 'express';
import notificationService from '../services/notification.service';

export class NotificationController {
    private notificationService = notificationService;

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;

            const notifications = await this.notificationService.getAllNotifications(limit, offset);
            res.json({ success: true, data: notifications });
        } catch (error) {
            next(error);
        }
    };

    getUnread = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const notifications = await this.notificationService.getUnreadNotifications();
            res.json({ success: true, data: notifications });
        } catch (error) {
            next(error);
        }
    };

    getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const count = await this.notificationService.getUnreadCount();
            res.json({ success: true, data: { count } });
        } catch (error) {
            next(error);
        }
    };

    markAsRead = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const notification = await this.notificationService.markAsRead(req.params.id);
            res.json({ success: true, data: notification });
        } catch (error) {
            next(error);
        }
    };

    markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const count = await this.notificationService.markAllAsRead();
            res.json({ success: true, data: { count } });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.notificationService.deleteNotification(req.params.id);
            res.json({ success: true, message: 'Notification deleted successfully' });
        } catch (error) {
            next(error);
        }
    };
}

export default new NotificationController();
