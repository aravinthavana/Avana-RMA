import { apiClient, ApiResponse } from './client';
import { Customer } from '../../types';

/**
 * Customer API service
 * Handles all customer-related API calls
 */
export const customersApi = {
    /**
     * Get all customers with pagination
     */
    getAll: async (
        page: number = 1,
        limit: number = 10,
        search?: string
    ): Promise<ApiResponse<Customer[]>> => {
        return apiClient.get<Customer[]>('/api/customers', {
            page,
            limit,
            search,
        });
    },

    /**
     * Get a single customer by ID
     */
    getById: async (id: string): Promise<ApiResponse<Customer>> => {
        return apiClient.get<Customer>(`/api/customers/${id}`);
    },

    /**
     * Create a new customer
     */
    create: async (data: Omit<Customer, 'id'>): Promise<ApiResponse<Customer>> => {
        return apiClient.post<Customer>('/api/customers', data);
    },

    /**
     * Update an existing customer
     */
    update: async (id: string, data: Omit<Customer, 'id'>): Promise<ApiResponse<Customer>> => {
        return apiClient.put<Customer>(`/api/customers/${id}`, data);
    },

    /**
     * Delete a customer
     */
    delete: async (id: string, deleteRmas: boolean = false): Promise<ApiResponse<void>> => {
        return apiClient.delete<void>(`/api/customers/${id}?deleteRmas=${deleteRmas}`);
    },
};
