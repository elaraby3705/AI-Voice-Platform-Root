import axios from 'axios';

// 1. Dynamic Base URL Construction
// Priority: VITE_API_URL (from .env) -> window.location.hostname (Dynamic LAN/Localhost)
const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // Fallback for local development without .env
    const hostname = window.location.hostname;
    return `http://${hostname}:8000/api/v1`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// 2. Request Interceptor (The Security Guard)
// Attaches the JWT Access Token to every outgoing request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');

        // Only attach token if it exists and request is not to an external URL
        if (token && config.baseURL?.includes(window.location.hostname)) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Debugging (Optional - remove in production)
        // console.log(`🚀 API Request: [${config.method.toUpperCase()}] ${config.url}`);

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Response Interceptor (The Error Handler)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.warn("⚠️ Unauthorized! Token might be expired.");

            // TODO: Add Refresh Token logic here in the future
            // For now, we let the AuthContext handle the redirect if needed
        }

        // Handle Network Errors (Server down / CORS)
        if (!error.response) {
            console.error("🚨 Network Error: Backend is unreachable.");
        }

        return Promise.reject(error);
    }
);

export default api;