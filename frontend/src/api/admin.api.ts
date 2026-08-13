import { apiClient, ApiResponse } from './client';
import { API_BASE_URL } from '../../config';

export const adminApi = {
    /**
     * Download full PostgreSQL database backup
     */
    downloadDatabaseBackup: async (): Promise<void> => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/backup`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to download backup');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Avana_RMA_Database_Backup_${new Date().toISOString().split('T')[0]}.sql`);

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download database backup', error);
            throw error;
        }
    },

    /**
     * Upload an SQL file to restore the database
     */
    restoreDatabaseBackup: async (file: File): Promise<ApiResponse<void>> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            
            // Using native fetch because apiClient defaults to Content-Type: application/json
            const response = await fetch(`${API_BASE_URL}/api/admin/restore`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do NOT set Content-Type, fetch will automatically set it to multipart/form-data with the correct boundary
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to restore database');
            }

            return data;
        } catch (error) {
            console.error('Failed to restore database backup', error);
            throw error;
        }
    }
};
