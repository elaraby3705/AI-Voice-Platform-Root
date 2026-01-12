import axios from 'axios';

// 1. Dynamic Base URL
// Using window.location.hostname ensures it works on Localhost AND over Network (LAN)
const BASE_URL = `http://${window.location.hostname}:8000/api/v1`;

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Request Interceptor
// Automatically adds the 'Authorization: Bearer <token>' header
api.interceptors.request.use(
    (config) => {
        // CRITICAL FIX: Changed 'token' to 'access_token' to match AuthContext logic
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Response Interceptor
// Handles global errors like 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized access detected. Session might be expired.");
            // Note: We avoid forcing a redirect here to prevent infinite loops.
            // We let the UI components or AuthContext handle the user navigation.
        }
        return Promise.reject(error);
    }
);

export default api;