import { apiClient } from './client';

export const adminApi = {
    /**
     * Download full PostgreSQL database backup
     */
    downloadDatabaseBackup: async (): Promise<void> => {
        try {
            // Use apiClient to get the file content
            // The apiClient processes non-JSON responses into { message: string }
            const res = await apiClient.get<any>('/api/admin/backup');
            const fileContent = res.message || res;

            const blob = new Blob([fileContent], { type: 'application/sql;charset=utf-8;' });
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
    }
};
