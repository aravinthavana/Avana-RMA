import { AuditLog } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface GetAuditLogsResponse {
    success: boolean;
    data: AuditLog[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface GetAuditLogsParams {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    entity?: string;
}

export const auditApi = {
    getAll: async (params: GetAuditLogsParams = {}): Promise<GetAuditLogsResponse> => {
        const token = localStorage.getItem('token');

        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.userId) queryParams.append('userId', params.userId);
        if (params.action) queryParams.append('action', params.action);
        if (params.entity) queryParams.append('entity', params.entity);

        const response = await fetch(`${API_URL}/audit?${queryParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch audit logs');
        }

        return response.json();
    }
};
