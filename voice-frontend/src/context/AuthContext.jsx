import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // State for User and Token
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('access_token') || null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    // 🚀 DYNAMIC API URL (The Magic Fix)
    // This automatically detects your VM IP (192.168.100.30) so you don't get Connection Refused
    const API_URL = `http://${window.location.hostname}:8000/api`;

    // 🔄 1. Check Auth on App Start
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

    // 🔑 2. Login Function
    const login = async (username, password) => {
        try {
            console.log(`📡 Connecting to: ${API_URL}/token/`);

            // We use standard axios here to ensure we hit the Dynamic IP
            const response = await axios.post(`${API_URL}/token/`, {
                username, // Django SimpleJWT expects 'username', not 'email' by default
                password
            });

            // Standard SimpleJWT response: { access: "...", refresh: "..." }
            const { access, refresh } = response.data;

            if (!access) throw new Error("No access token received!");

            // 1. Store Tokens
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            setToken(access);

            // 2. Set User Data (Mocking it for now since /token/ doesn't return user info)
            const userData = { username: username };
            localStorage.setItem('user_data', JSON.stringify(userData));
            setUser(userData);

            toast.success('System Access Granted.');
            navigate('/dashboard');
            return true;

        } catch (error) {
            console.error("Login Error:", error);

            // Smart Error Handling
            if (error.code === "ERR_NETWORK") {
                toast.error(`Cannot connect to VM at ${API_URL}`);
            } else if (error.response?.status === 401) {
                toast.error("Invalid Username or Password.");
            } else {
                toast.error("Login failed. Check console.");
            }
            return false;
        }
    };

    // 📝 3. Register Function
    const register = async (userData) => {
        try {
            // Using the dynamic URL
            await axios.post(`${API_URL}/register/`, userData);

            toast.success('Identity Created Successfully.');

            // Automatically log the user in after registration
            return await login(userData.username, userData.password);

        } catch (error) {
            console.error("Register Error:", error);
            const msg = error.response?.data?.username ? "Username taken" : "Registration failed";
            toast.error(msg);
            return false;
        }
    };

    // 🚪 4. Logout Function
    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setToken(null);
        setUser(null);
        toast.success('Session Terminated.');
        navigate('/login');
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
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