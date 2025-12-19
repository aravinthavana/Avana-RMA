import { API_BASE_URL } from '../../config';

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * API Error class for better error handling
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public response?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Base API client with centralized error handling
 */
class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    /**
     * Generic request method
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;

        const config: RequestInit = {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        // Attach token if exists
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            // Check if headers is defined and is a plain object (which it is above)
            (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);

            // Try to parse response as JSON
            let data;
            const contentType = response.headers.get('content-type');

            if (contentType?.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                data = { message: text };
            }

            // Handle error responses
            if (!response.ok) {
                throw new ApiError(
                    data.error || data.message || `HTTP ${response.status}`,
                    response.status,
                    data
                );
            }

            // Return standardized response
            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            // Network or other errors
            throw new ApiError(
                error instanceof Error ? error.message : 'Network error occurred',
                undefined,
                error
            );
        }
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
        const queryString = params
            ? '?' + new URLSearchParams(
                Object.entries(params)
                    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
                    .map(([key, value]) => [key, String(value)])
            ).toString()
            : '';

        return this.request<T>(`${endpoint}${queryString}`, {
            method: 'GET',
        });
    }

    /**
     * POST request
     */
    async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    /**
     * PUT request
     */
    async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    /**
     * PATCH request
     */
    async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
        });
    }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
