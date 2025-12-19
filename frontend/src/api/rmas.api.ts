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
};
