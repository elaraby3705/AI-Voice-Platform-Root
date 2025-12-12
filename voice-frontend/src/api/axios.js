// src/api/axios.js
import axios from 'axios';

// 1. Define the Base URL for your Django Backend
const BASE_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Request Interceptor
// Automatically adds the 'Authorization: Bearer <token>' header if a token exists.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Response Interceptor (Optional but recommended)
// Handles global errors, like 401 Unauthorized (token expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // You can add logic here to redirect to login if 401 occurs
        if (error.response && error.response.status === 401) {
            console.error("Unauthorized! Token might be invalid.");
            // Optional: localStorage.removeItem('token');
            // Optional: window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;