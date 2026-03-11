import { apiClient, ApiResponse } from './client';
import { Rma, RmaStatus } from '../../types';

/**
 * RMA API service
 * Handles all RMA-related API calls
 */

export interface RmaFilters {
    search?: string;
    status?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    isInjuryRelated?: boolean;
}

export interface StatusUpdateData {
    deviceSerialNumber: string;
    newStatus: RmaStatus;
    notes: string;
}

export const rmasApi = {
    /**
     * Get all RMAs with pagination and filters
     */
    getAll: async (
        page: number = 1,
        limit: number = 50,
        filters?: RmaFilters
    ): Promise<ApiResponse<Rma[]>> => {
        return apiClient.get<Rma[]>('/api/rmas', {
            page,
            limit,
            ...filters,
        });
    },

    /**
     * Get a single RMA by ID
     */
    getById: async (id: string): Promise<ApiResponse<Rma>> => {
        return apiClient.get<Rma>(`/api/rmas/${id}`);
    },

    /**
     * Create a new RMA
     */
    create: async (data: any): Promise<ApiResponse<Rma>> => {
        return apiClient.post<Rma>('/api/rmas', data);
    },

    /**
     * Update an existing RMA
     */
    update: async (id: string, data: any): Promise<ApiResponse<Rma>> => {
        return apiClient.put<Rma>(`/api/rmas/${id}`, data);
    },

    /**
     * Delete an RMA
     */
    delete: async (id: string): Promise<ApiResponse<void>> => {
        return apiClient.delete<void>(`/api/rmas/${id}`);
    },

    /**
     * Update RMA status
     */
    updateStatus: async (
        rmaId: string,
        statusData: StatusUpdateData
    ): Promise<ApiResponse<{ lastUpdateDate: string }>> => {
        return apiClient.patch<{ lastUpdateDate: string }>(
            `/api/rmas/${rmaId}/status`,
            statusData
        );
    },

    /**
     * Add a new service cycle to an RMA
     */
    addServiceCycle: async (
        rmaId: string,
        cycleData: {
            deviceSerialNumber: string;
            status: string;
            issueDescription?: string;
            accessoriesIncluded?: string;
        }
    ): Promise<ApiResponse<any>> => {
        return apiClient.post(`/api/rmas/${rmaId}/cycles`, cycleData);
    },

    /**
     * Update service cycle status
     */
    updateCycleStatus: async (
        cycleId: number,
        statusData: { status: string; notes?: string }
    ): Promise<ApiResponse<any>> => {
        return apiClient.put(`/api/rmas/cycles/${cycleId}/status`, statusData);
    },

    /**
     * Export RMAs to CSV using native fetch (not the JSON apiClient)
     * because the CSV is a binary stream, not a JSON response.
     * B-5: Removes dependency on the undocumented {message: text} side-effect in ApiClient.
     */
    exportCsv: async (filters?: RmaFilters): Promise<void> => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const params = filters
            ? '?' + new URLSearchParams(
                Object.entries(filters)
                    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
                    .map(([k, v]) => [k, String(v)])
            ).toString()
            : '';

        const apiBase = (window as any).__VITE_API_BASE_URL__ ||
            import.meta.env.VITE_API_BASE_URL ||
            '';

        const response = await fetch(`${apiBase}/api/rmas/export${params}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody?.error || `Export failed: HTTP ${response.status}`);
        }

        const csvContent = await response.text();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `RMA_Export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },
};
