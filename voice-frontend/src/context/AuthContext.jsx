import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Import the API configuration and helper functions
import api from '../api/axios';
import { registerUser, loginUser, verifyEmail } from '../api/auth';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // Using 'access_token' to match your axios.js interceptor
    const [token, setToken] = useState(localStorage.getItem('access_token') || null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 1. Initialization: Check Auth & Fetch User on Load
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('access_token');

            if (storedToken) {
                setToken(storedToken);
                try {
                    // We use the 'api' instance which automatically attaches the token
                    await fetchUser();
                } catch (error) {
                    console.log("Token invalid or expired");
                    logout(false); // Silent logout
                }
            } else {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // 2. Fetch User Profile
    const fetchUser = async () => {
        try {
            // Assumes endpoint is 'accounts/me/' or just 'me/' depending on urls.py
            // Using 'api' instance handles the Base URL and Headers
            const response = await api.get('accounts/me/');
            setUser(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch user", error);
            setLoading(false);
            throw error;
        }
    };

    // 3. Register Function (Step 1: Send OTP)
    const register = async (userData) => {
        try {
            // Call API to send OTP email
            await registerUser(userData);

            toast.success('Account created! Please check your email for the code.');
            // We DO NOT set token here anymore.
            // The UI should verify success and move to Step 2 (OTP Input).
            return true;

        } catch (error) {
            console.error("Register Error:", error);
            const errorMsg = error.response?.data?.error || "Registration failed.";
            toast.error(errorMsg);
            throw error; // Throw to let the Component handle UI state (like loading spinners)
        }
    };

    // 4. Verify OTP Function (Step 2: Login)
    const verifyOtp = async (email, otp) => {
        try {
            // Exchange OTP for Tokens
            const data = await verifyEmail(email, otp);

            // Save Tokens
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            // Update State
            setToken(data.access);
            setUser(data.user); // Assuming the backend returns user object here

            toast.success('Identity Verified. Access Granted.');
            navigate('/projects'); // Redirect to Dashboard
            return true;

        } catch (error) {
            console.error("Verification Error:", error);
            toast.error("Invalid Code. Please try again.");
            throw error;
        }
    };

    // 5. Login Function
    const login = async (credentials) => {
        try {
            const data = await loginUser(credentials);

            // Save Tokens
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            setToken(data.access);

            // Fetch User Data immediately after login
            // (Unless 'data.user' is already returned by login endpoint)
            if (data.user) {
                setUser(data.user);
            } else {
                await fetchUser();
            }

            toast.success('Welcome back, Commander.');
            navigate('/projects');
            return true;

        } catch (error) {
            console.error("Login Error:", error);
            if (error.response?.status === 401) {
                toast.error("Invalid Credentials.");
            } else {
                toast.error("Login failed.");
            }
            throw error;
        }
    };

    // 6. Logout Function
    const logout = (callApi = true) => {
        // Optional: Call backend logout if needed
        // if (callApi) { ... api.post('accounts/logout/') ... }

        // Cleanup Local Storage
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
        verifyOtp, // Exported for the UI to use
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