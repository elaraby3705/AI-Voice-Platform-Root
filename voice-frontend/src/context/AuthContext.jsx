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

    // Dynamic API URL for Localhost/VM
    const API_URL = `http://${window.location.hostname}:8000/api/v1/auth`;

    // 1. Check Auth on Load
    useEffect(() => {
        const checkAuth = () => {
            const storedToken = localStorage.getItem('access_token');
            const storedUser = localStorage.getItem('user_data');

            if (storedToken) {
                setToken(storedToken);
                // Set default axios header so we don't have to repeat it
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch (e) {
                        console.error("Error parsing user data", e);
                        localStorage.clear();
                    }
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    // 2. Login Function
    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/login/`, {
                email,
                password
            });

            const { access, refresh, user } = response.data;

            if (!access) throw new Error("No access token received!");

            // 1. Store Tokens
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            setToken(access);

            // 2. Set Axios Default Header
            axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

            // 3. Store User Data
            localStorage.setItem('user_data', JSON.stringify(user));
            setUser(user);

            toast.success('System Access Granted.');
            navigate('/dashboard');
            return true;

        } catch (error) {
            console.error("Login Error:", error);
            if (error.response?.status === 401) {
                toast.error("Invalid Credentials.");
            } else {
                toast.error("Login failed.");
            }
            return false;
        }
    };

    // 3. Register Function
    const register = async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/register/`, userData);

            if (response.data.access) {
                const { access, refresh, user } = response.data;
                localStorage.setItem('access_token', access);
                localStorage.setItem('refresh_token', refresh);
                localStorage.setItem('user_data', JSON.stringify(user));
                setToken(access);
                setUser(user);
                axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                toast.success('Identity Created. Logging in...');
                navigate('/dashboard');
                return true;
            }

            toast.success('Identity Created Successfully.');
            navigate('/login');
            return true;

        } catch (error) {
            console.error("Register Error:", error);
            toast.error("Registration failed.");
            return false;
        }
    };

    // 4. Logout Function
    const logout = async () => {
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken && token) {
            try {
                await axios.post(`${API_URL}/logout/`,
                    { refresh: refreshToken },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err) {
                console.warn("Server logout failed, clearing local anyway.");
            }
        }

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        delete axios.defaults.headers.common['Authorization'];

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