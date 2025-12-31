import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// 1. Create and Export the Context
export const AuthContext = createContext();

// 2. Create and Export the Hook (so you can use 'useAuth()' anywhere)
export const useAuth = () => useContext(AuthContext);

// 3. The Provider Component
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 🚀 DYNAMIC BACKEND URL (Crucial for VM/LAN access)
    // This automatically grabs '192.168.100.30' or 'localhost' from your browser bar
    // and adds port 8000. No more hardcoded IP errors.
    const API_URL = `http://${window.location.hostname}:8000/api`;

    // 4. Check Auth Status on Load (Persist Login)
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('access_token');
            const storedUser = localStorage.getItem('user_data');

            if (token && storedUser) {
                try {
                    setCurrentUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse user data", e);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    // 5. Login Action
    const login = async (username, password) => {
        try {
            console.log(`📡 Connecting to Backend at: ${API_URL}/token/`);

            // POST request to Django Backend
            // We use the dynamic API_URL here
            const response = await axios.post(`${API_URL}/token/`, {
                username,
                password
            });

            // Extract tokens from response
            const { access, refresh } = response.data;

            // Store data in LocalStorage
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            // Set User State
            // (Ideally, you would fetch the full profile from /api/me/ here)
            const userData = { username, email: "user@example.com" };
            localStorage.setItem('user_data', JSON.stringify(userData));

            setCurrentUser(userData);
            toast.success("System Access Granted.");

            // Redirect to Dashboard
            navigate('/dashboard');
            return true;

        } catch (error) {
            console.error("Login Error:", error);

            // Detailed Error Handling for easier debugging
            if (error.code === "ERR_NETWORK") {
                toast.error(`Backend Unreachable at ${API_URL}. Check Docker logs.`);
            } else if (error.response?.status === 401) {
                toast.error("Access Denied: Invalid Credentials.");
            } else {
                toast.error("Login failed. Please try again.");
            }
            return false;
        }
    };

    // 6. Register Action
    const register = async (userData) => {
        try {
            console.log(`📡 Registering at: ${API_URL}/register/`);

            // POST request to create user
            await axios.post(`${API_URL}/register/`, userData);

            toast.success("Identity Created Successfully.");

            // Auto-Login after registration
            // We reuse the login function we just wrote
            return await login(userData.username, userData.password);

        } catch (error) {
            console.error("Registration Error:", error);
            if (error.response?.data?.username) {
                toast.error("Username already taken.");
            } else {
                toast.error("Registration failed. Try a different username.");
            }
            return false;
        }
    };

    // 7. Logout Action
    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setCurrentUser(null);
        toast('Session Terminated', { icon: '👋' });
        navigate('/');
    };

    const value = {
        currentUser,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};