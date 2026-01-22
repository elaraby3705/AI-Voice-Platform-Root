import api from './axios'; // Importing your configured axios instance

// Define the URL prefix for account-related endpoints
const AUTH_URL = 'accounts/';

// 1. Register User
// Sends user data to backend to trigger the OTP email
export const registerUser = async (userData) => {
    // Final URL: /api/v1/accounts/register/
    const response = await api.post(`${AUTH_URL}register/`, userData);
    return response.data;
};

// 2. Verify Email
// Sends the email and OTP code to verify the account and retrieve tokens
export const verifyEmail = async (email, otp) => {
    // Final URL: /api/v1/accounts/verify-email/
    const response = await api.post(`${AUTH_URL}verify-email/`, {
        email: email,
        otp: otp
    });
    return response.data;
};

// 3. Login User
// Standard login to retrieve tokens
export const loginUser = async (credentials) => {
    // Final URL: /api/v1/accounts/login/
    const response = await api.post(`${AUTH_URL}login/`, credentials);
    return response.data;
};