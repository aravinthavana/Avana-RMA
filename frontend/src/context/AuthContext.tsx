import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, User } from '../api/auth.api';
import { apiClient } from '../api/client'; // Import apiClient to set token header
import toast from 'react-hot-toast';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            // Check both storages
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (token) {
                try {
                    // Verify token by fetching user profile
                    // IMPORTANT: We need to set the token on the apiClient manually first?
                    // Actually, let's assume apiClient intercepts checking localStorage, 
                    // but we should probably update how apiClient works to support both storage types
                    // For now, let's try to fetch Me.
                    // Note: In a real app, you might decode the JWT first to check expiry.

                    // We rely on the apiClient implementation to attach the header.
                    // Since our apiClient (client.ts) likely reads from localStorage only, 
                    // we might need to update client.ts OR just manually check here.

                    // Let's verify if the token is valid by calling /me
                    // We manually set header for this check if needed, but apiClient usually handles it.
                    // Assuming apiClient reads localStorage. If token is in sessionStorage, 
                    // apiClient might miss it if hardcoded to localStorage.

                    // apiClient reads sessionStorage first (see client.ts), so no sync needed

                    const { data, error } = await authApi.me();
                    if (data) {
                        setUser(data);
                    } else {
                        console.error('Initial auth check failed:', error);
                        logout(); // Clear invalid token
                    }
                } catch (error) {
                    console.error('Auth init error:', error);
                    logout();
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string, rememberMe: boolean): Promise<boolean> => {
        setIsLoading(true);
        try {
            const { data, error } = await authApi.login(email, password);

            if (data) {
                setUser(data.user);

                // Store token based on "Remember Me"
                if (rememberMe) {
                    localStorage.setItem('token', data.token);
                    sessionStorage.removeItem('token');
                } else {
                    // Not remembering — session-only token (cleared when the browser tab closes)
                    sessionStorage.setItem('token', data.token);
                    localStorage.removeItem('token'); // Ensure no stale persistent copy exists

                }

                toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
                return true;
            } else {
                toast.error(error || 'Login failed');
                return false;
            }
        } catch (error: any) {
            // Only log if it's not a standard auth failure
            if (error?.statusCode !== 401) {
                console.error('Login error:', error);
            }
            // For 401, the return false allows the Login component to show "Invalid credentials"
            // For other errors, we might want a toast
            if (error?.statusCode !== 401) {
                toast.error('An unexpected error occurred');
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        toast.success('Logged out successfully');
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
