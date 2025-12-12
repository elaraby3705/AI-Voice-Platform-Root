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

    // 🔑 2. Login Function
    const login = async (username, password) => {
        try {
            // Hitting the Django Token Endpoint
            const response = await api.post('/token/', { username, password });

            // Assuming response format: { access: "...", refresh: "..." }
            const accessToken = response.data.access;

            localStorage.setItem('token', accessToken);
            setToken(accessToken);
            setUser({ username }); // Set basic user info

            toast.success('System Access Granted.');
            navigate('/dashboard'); // Redirect to dashboard after login

        } catch (error) {
            console.error("Login Error:", error);
            const msg = error.response?.data?.detail || "Invalid credentials.";
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