import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Ensure you have axios installed
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 1. Check if user is already logged in on page load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            const storedUser = localStorage.getItem('user_data');

            if (token && storedUser) {
                // Optional: Verify token validity with backend here
                setCurrentUser(JSON.parse(storedUser));
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    // 2. The Login Action
    const login = async (username, password) => {
        try {
            // Adjust this URL to match your Django Endpoint exactly
            const response = await axios.post('http://127.0.0.1:8000/api/token/', {
                username,
                password
            });

            const { access, refresh } = response.data;

            // Store Tokens
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            // Mock User Data (Or fetch from /api/users/me/ after login)
            const userData = { username: username, email: "user@example.com" };
            localStorage.setItem('user_data', JSON.stringify(userData));

            setCurrentUser(userData);

            toast.success("System Access Granted.");
            navigate('/dashboard'); // 🚀 Redirect to Dashboard
            return true;

        } catch (error) {
            console.error("Login Error:", error);
            toast.error("Access Denied: Invalid Credentials.");
            return false;
        }
    };

    // 3. The Register Action (With Auto-Login)
    const register = async (userData) => {
        try {
            // 1. Create User
            await axios.post('http://127.0.0.1:8000/api/register/', userData);

            toast.success("Identity Created Successfully.");

            // 2. Auto-Login immediately (The Professional Way)
            // We use the same credentials they just typed to log them in
            return await login(userData.username, userData.password);

        } catch (error) {
            console.error("Registration Error:", error);
            const msg = error.response?.data?.username ? "Username already taken." : "Registration failed.";
            toast.error(msg);
            return false;
        }
    };

    // 4. Logout Action
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