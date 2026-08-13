import { AuditLog } from '../../types';
import { apiClient } from './client';

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
        return apiClient.get('/api/audit', params);
    }
};
