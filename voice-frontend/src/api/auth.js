import api from './axios';

const AUTH_URL = 'auth/';

// 1. Register User
export const registerUser = async (userData) => {
    // Final URL: /api/v1/auth/register/
    const response = await api.post(`${AUTH_URL}register/`, userData);
    return response.data;
};

// 2. Verify Email
export const verifyEmail = async (email, otp) => {
    const response = await api.post(`${AUTH_URL}verify-email/`, {
        email: email,
        otp: otp
    });
    return response.data;
};

// 3. Login User
export const loginUser = async (credentials) => {
    const response = await api.post(`${AUTH_URL}login/`, credentials);
    return response.data;
};