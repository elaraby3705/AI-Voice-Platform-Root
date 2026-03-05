import axios from 'axios';

// SOLUTION: Use a relative path so Nginx handles the routing internally
const getBaseUrl = () => {
    // Simply return the path. 
    // The browser will automatically prepend the current domain/port (Nginx at :80)
    return '/api/v1'; 
};

const api = axios.create({
    baseURL: getBaseUrl(),
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// 2. Request Interceptor 🛡️
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. Response Interceptor 🚨
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.warn("⚠️ Session Expired. Clearing token...");
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }

        if (!error.response) {
            console.error(`🚨 Network Error: Backend unreachable at ${getBaseUrl()}`);
        }

        return Promise.reject(error);
    }
);

export default api;
