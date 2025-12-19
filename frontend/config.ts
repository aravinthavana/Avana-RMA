// Helper to construct backend URL dynamically based on the environment
export const getApiBaseUrl = () => {
    // If explicitly set via env var (e.g. in dev or specific builds), use it
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }

    // Fallback / Smart logic for Cloud Workstations or other dynamic environments
    const { protocol, hostname } = window.location;
    if (hostname.includes('cloudworkstations.dev')) {
        // In Cloud Workstations, the backend is on a similar URL, but with port 3001
        return `${protocol}//${hostname.replace('3000-', '3001-')}`;
    } else {
        // Default to localhost for local development if nothing else matches
        return 'http://localhost:3001';
    }
};

export const API_BASE_URL = getApiBaseUrl();
