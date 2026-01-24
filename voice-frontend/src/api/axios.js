import axios from 'axios';

// 1. Dynamic Base URL Construction (The Smart Fix) 🧠
// This function ignores any hardcoded IPs in .env files that caused the timeout.
// It builds the URL based on your current browser address (localhost).
const getBaseUrl = () => {
    const hostname = window.location.hostname;
    // The result will be: http://localhost:8000/api/v1
    // This URL will pass through VirtualBox Port Forwarding and reach the backend successfully.
    return `http://${hostname}:8000/api/v1`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    timeout: 15000, // ⏳ Increased timeout to 15 seconds to account for any latency in the virtual network.
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// 2. Request Interceptor (Simple & Secure) 🛡️
api.interceptors.request.use(
    (config) => {
        // Retrieve the token using the correct key from local storage
        const token = localStorage.getItem('access_token');

        // Attach the token directly without complex hostname checks.
        // This resolves the 401 error caused by IP address mismatches in NAT environments.
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Response Interceptor (Error Handling) 🚨
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Scenario 1: Token expired (401 Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.warn("⚠️ Session Expired. Cleaning up...");

            // Clear browser storage to force a fresh, clean login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');

            // Redirect user to login page (optional, usually better handled by AuthContext)
            // window.location.href = '/login';
        }

        // Scenario 2: Server not responding (Network Error)
        // This happens if the backend is down or Port Forwarding is incorrect.
        if (!error.response) {
            console.error(`🚨 Network Error: Unable to reach Backend at ${getBaseUrl()}`);
            console.error("Check if Docker is running and Port 8000 is forwarded in VirtualBox.");
        }

        return Promise.reject(error);
    }
);

export default api;