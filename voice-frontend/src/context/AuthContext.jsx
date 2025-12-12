// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true); // Prevents flickering while checking auth

    const navigate = useNavigate();

    // 🔄 1. Check if user is already logged in when the app starts
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                setToken(storedToken);
                // Optional: If you had a /me endpoint, you would fetch user details here
                // setUser({ name: "Commander" });
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

// 🔑 2. Login Function (Final Production Version)
    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login/', { email, password });
            const accessToken = response.data.token; // key token
            const userData = response.data.user;     // user actual data

            if (!accessToken) {
                throw new Error("Login succeeded but no token received!");
            }

            //storing token in browser
            localStorage.setItem('token', accessToken);
            setToken(accessToken);

            //storing user data to be displayed in the dashboard
            setUser(userData);

            toast.success('System Access Granted.');
            navigate('/dashboard');

        } catch (error) {
            console.error("Login Error:", error);
            const msg = error.response?.data?.non_field_errors?.[0] ||
                        error.response?.data?.detail ||
                        "Login failed.";
            toast.error(msg);
        }
    };

    // 🚪 3. Logout Function
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        toast.success('Session Terminated.');
        navigate('/login');
    };

    // 📝 4. Register Function (Placeholder/Basic)
    const register = async (username, password, email) => {
        try {
            await api.post('/register/', { username, password, email });
            toast.success('Identity Created. Please log in.');
            navigate('/login');
        } catch (error) {
            console.error("Register Error:", error);
            toast.error("Registration failed. Try again.");
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        register,
        isAuthenticated: !!token
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Show a loading screen while checking for token */}
            {!loading ? children : (
                <div className="min-h-screen bg-black text-slate-400 flex items-center justify-center font-mono animate-pulse">
                    Initializing Neural Interface...
                </div>
            )}
        </AuthContext.Provider>
    );
};