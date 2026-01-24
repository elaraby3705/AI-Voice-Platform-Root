import axios from 'axios';

// 1. Dynamic Base URL Construction
const getBaseUrl = () => {
    // ⚠️ FIX: We force the use of the current browser hostname (localhost).
    // This ignores any old/broken IP addresses that might be cached in your .env file.
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
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');

        // ⚠️ FIX: Simplified logic.
        // We attach the token whenever it exists, without checking the hostname.
        // This solves the 401 error when switching between IPs/Localhost.
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

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

        // Handle 401 Unauthorized (Token Expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.warn("⚠️ Unauthorized! Token might be expired.");
            // You can uncomment the line below if you want to auto-logout
            // localStorage.removeItem('access_token');
            // window.location.href = '/login';
        }

        // Handle Network Errors (Server Down / Wrong IP)
        if (!error.response) {
            console.error("🚨 Network Error: Backend is unreachable at " + error.config.baseURL);
        }

        return Promise.reject(error);
    }
);

export default api;