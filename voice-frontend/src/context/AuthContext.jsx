import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('access_token') || null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 🚀 FIXED: Pointing to the correct "v1/auth" path
    // This resolves to: http://192.168.100.30:8000/api/v1/auth
    const API_URL = `http://${window.location.hostname}:8000/api/v1/auth`;

    // 1. Check Auth on Load
    useEffect(() => {
        const checkAuth = () => {
            const storedToken = localStorage.getItem('access_token');
            const storedUser = localStorage.getItem('user_data');

            if (storedToken) {
                setToken(storedToken);
                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch (e) {
                        console.error("Error parsing user data", e);
                    }
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    // 2. Login Function
    const login = async (email, password) => { // You likely use 'email' based on your previous messages
        try {
            console.log(`📡 Connecting to: ${API_URL}/login/`);

            // 👇 UPDATED: Matches your working endpoint
            const response = await axios.post(`${API_URL}/login/`, {
                email, // Sending 'email' as per your Postman test
                password
            });

            // Adjust this depending on your EXACT response structure
            // If backend returns { key: "..." } or { token: "..." } change this line
            const accessToken = response.data.key || response.data.token || response.data.access;

            if (!accessToken) throw new Error("No access token received!");

            // Store Data
            localStorage.setItem('access_token', accessToken);
            setToken(accessToken);

            // Store User (Mock or from response)
            const userData = response.data.user || { email: email };
            localStorage.setItem('user_data', JSON.stringify(userData));
            setUser(userData);

            toast.success('System Access Granted.');
            navigate('/dashboard');
            return true;

        } catch (error) {
            console.error("Login Error:", error);

            if (error.code === "ERR_NETWORK") {
                toast.error(`Cannot connect to ${API_URL}`);
            } else if (error.response?.status === 404) {
                toast.error(`Endpoint not found: ${API_URL}/login/`);
            } else if (error.response?.status === 401 || error.response?.status === 400) {
                toast.error("Invalid Email or Password.");
            } else {
                toast.error("Login failed.");
            }
            return false;
        }
    };

    // 3. Register Function
    const register = async (userData) => {
        try {
            // 👇 UPDATED: Matches the same pattern
            await axios.post(`${API_URL}/register/`, userData);

            toast.success('Identity Created Successfully.');
            return await login(userData.email, userData.password);

        } catch (error) {
            console.error("Register Error:", error);
            toast.error("Registration failed.");
            return false;
        }
    };

    // 4. Logout Function
    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        setToken(null);
        setUser(null);
        toast.success('Session Terminated.');
        navigate('/login');
    };

    const value = { user, token, loading, login, register, logout, isAuthenticated: !!token };

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