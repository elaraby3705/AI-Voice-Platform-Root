// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { auth } from "../firebase"; // Ensure this path is correct for your project

// ✅ FIX: Export the Context directly so other files (like useAuth.js) can use it
export const AuthContext = createContext();

// This hook is here for convenience, but since you have a separate useAuth.js,
// you might be using that one instead. That is fine.
export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sign Up (Email/Pass)
    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    // Login (Email/Pass)
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Login (Google)
    function googleSignIn() {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    }

    // Logout
    function logout() {
        return signOut(auth);
    }

    // Listen for auth state changes (Persist session)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        signup,
        login,
        googleSignIn,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}