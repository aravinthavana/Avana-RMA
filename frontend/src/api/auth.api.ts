import { apiClient, ApiResponse } from './client';

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
}

export interface AuthResponse {
    token: string;
    user: User;
}

/**
 * Auth API service
 */
export const authApi = {
    /**
     * Login user
     */
    login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
        return apiClient.post<AuthResponse>('/api/auth/signin', { email, password });
    },

    /**
     * Get current user profile
     */
    me: async (): Promise<ApiResponse<User>> => {
        return apiClient.get<User>('/api/auth/me');
    },

    /**
     * Change password
     */
    changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
        return apiClient.post<void>('/api/auth/change-password', { currentPassword, newPassword });
    },
    /**
     * Request password reset
     */
    forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
        return apiClient.post<void>('/api/auth/forgot-password', { email });
    },
};
