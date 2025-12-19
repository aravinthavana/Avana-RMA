import { apiClient, ApiResponse } from './client';

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
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
        return apiClient.post<AuthResponse>('/api/auth/login', { email, password });
    },

    /**
     * Get current user profile
     */
    me: async (): Promise<ApiResponse<User>> => {
        return apiClient.get<User>('/api/auth/me');
    },
};
