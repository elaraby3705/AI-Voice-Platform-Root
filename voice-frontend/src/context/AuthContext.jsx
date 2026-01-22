import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Import the API helpers we created earlier
import api from '../api/axios';
import { registerUser, loginUser, verifyEmail } from '../api/auth';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // We use 'access_token' to match your axios interceptor logic
    const [token, setToken] = useState(localStorage.getItem('access_token') || null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 1. Check Auth on Load
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('access_token');
            if (storedToken) {
                setToken(storedToken);
                try {
                    // Verify token validity by fetching user profile
                    await fetchUser();
                } catch (error) {
                    console.warn("Token expired or invalid.");
                    logout(false);
                }
            } else {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    // Helper: Fetch User Data
    const fetchUser = async () => {
        try {
            const response = await api.get('accounts/me/');
            setUser(response.data);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // 2. Register (Step 1: Send OTP)
    // ⚠️ CRITICAL CHANGE: This function NO LONGER redirects.
    const register = async (userData) => {
        try {
            await registerUser(userData);

            toast.success('Verification code sent to your email.');
            // Return true so the UI knows to switch to Step 2
            return true;

        } catch (error) {
            console.error("Register Error:", error);
            const errorMsg = error.response?.data?.email
                ? error.response.data.email[0]
                : (error.response?.data?.error || "Registration failed.");

            toast.error(errorMsg);
            return false;
        }
    };

    // 3. Verify OTP (Step 2: Auto-Login)
    const verifyOtp = async (email, otp) => {
        try {
            const data = await verifyEmail(email, otp);

            // Save Tokens
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            // Update State
            setToken(data.access);
            setUser(data.user);

            toast.success('Identity Verified. Access Granted.');

            // ✅ Redirect to Dashboard immediately after verification
            navigate('/projects');
            return true;

        } catch (error) {
            console.error("Verification Error:", error);
            toast.error("Invalid Code. Please try again.");
            throw error;
        }
    };

    // 4. Login (Standard)
    const login = async (credentials) => {
        try {
            const data = await loginUser(credentials);

            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            setToken(data.access);

            if (data.user) {
                setUser(data.user);
            } else {
                await fetchUser();
            }

            toast.success('Welcome back.');
            navigate('/projects');
            return true;

        } catch (error) {
            console.error("Login Error:", error);
            toast.error(error.response?.status === 401 ? "Invalid Credentials." : "Login failed.");
            throw error;
        }
    };

    // 5. Logout
    const logout = (callApi = true) => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setToken(null);
        setUser(null);
        if (callApi) toast.success('Session Terminated.');
        navigate('/login');
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        verifyOtp,
        logout,
        fetchUser,
        isAuthenticated: !!token
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : (
                <div className="min-h-screen bg-black text-indigo-500 flex items-center justify-center font-mono animate-pulse">
                    Initializing Neural Interface...
                </div>
            )}
        </AuthContext.Provider>
    );
};

export default AuthContext;