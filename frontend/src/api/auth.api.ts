import { apiClient, ApiResponse } from './client';

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    isAdmin?: boolean;
    isActive: boolean;
    lastLoginAt?: string;
    signatureUrl?: string;
    profilePictureUrl?: string;
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
    
    /**
     * Upload signature
     */
    uploadSignature: async (file: File): Promise<ApiResponse<{ signatureUrl: string }>> => {
        const formData = new FormData();
        formData.append('signature', file);
        return apiClient.post<{ signatureUrl: string }>('/api/auth/profile/signature', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    /**
     * Remove signature
     */
    removeSignature: async (): Promise<ApiResponse<void>> => {
        return apiClient.delete<void>('/api/auth/profile/signature');
    },
};
