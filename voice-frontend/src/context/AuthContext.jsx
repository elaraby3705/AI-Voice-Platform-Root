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

    // 1. Check Auth on Load & Fetch User (Using the 'Me' Endpoint)
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('access_token');

            if (storedToken) {
                setToken(storedToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

                // ⚠️ NEW: We try to fetch fresh user data from the backend
                // This ensures the token is actually valid on the server
                try {
                    await fetchUser();
                } catch (error) {
                    console.log("Token invalid or expired");
                    logout(false); // Logout without API call if token is invalid
                }
            } else {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // 🆕 4. Fetch User Function (The Missing Endpoint)
    const fetchUser = async () => {
        try {
            // GET /api/v1/auth/me/
            const response = await axios.get(`${API_URL}/me/`);
            setUser(response.data);
            localStorage.setItem('user_data', JSON.stringify(response.data));
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch user", error);
            setLoading(false);
            throw error; // Let the caller handle the error
        }
    };

    // 2. Login Function
    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/login/`, {
                email,
                password
            });

            const { access, refresh, user } = response.data;

            if (!access) throw new Error("No access token received!");

            // Store Tokens
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            setToken(access);

            // Set Header
            axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

            // Set User
            // Note: If your LoginSerializer returns user data, use it.
            // If not, we call fetchUser() immediately after.
            if (user) {
                setUser(user);
                localStorage.setItem('user_data', JSON.stringify(user));
            } else {
                await fetchUser();
            }

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
                setToken(access);
                axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

                if (user) {
                    setUser(user);
                    localStorage.setItem('user_data', JSON.stringify(user));
                } else {
                    await fetchUser();
                }

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
    // Added 'callApi' flag to prevent infinite loops if token is already dead
    const logout = async (callApi = true) => {
        const refreshToken = localStorage.getItem('refresh_token');

        if (callApi && refreshToken && token) {
            try {
                await axios.post(`${API_URL}/logout/`,
                    { refresh: refreshToken },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err) {
                console.warn("Server logout failed, clearing local anyway.");
            }
        }

        // Cleanup Local Storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        delete axios.defaults.headers.common['Authorization'];

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
        logout,
        fetchUser, // Exported so you can manually refresh user data if needed
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