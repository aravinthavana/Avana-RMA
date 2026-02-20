import { apiClient } from './client';

export interface Notification {
    id: string;
    type: string;
    message: string;
    metadata?: string;
    isRead: boolean;
    createdAt: string;
}

export const notificationApi = {
    async getAll(limit: number = 50, offset: number = 0) {
        return await apiClient.get<Notification[]>(`/api/notifications?limit=${limit}&offset=${offset}`);
    },

    async getUnread() {
        return await apiClient.get<Notification[]>('/api/notifications/unread');
    },

    async getUnreadCount() {
        return await apiClient.get<{ count: number }>('/api/notifications/unread/count');
    },

    async markAsRead(id: string) {
        return await apiClient.patch<Notification>(`/api/notifications/${id}/read`, {});
    },

    async markAllAsRead() {
        return await apiClient.patch<{ count: number }>('/api/notifications/read-all', {});
    },

    async delete(id: string) {
        return await apiClient.delete(`/api/notifications/${id}`);
    }
};
