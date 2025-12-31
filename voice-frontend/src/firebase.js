// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// 1️⃣ ADD THIS LINE: Import Auth
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4llJOMjWuSgW6XBQxwrK-3ej4oEk4kNU",
  authDomain: "ai-voice-platform-9adc7.firebaseapp.com",
  projectId: "ai-voice-platform-9adc7",
  storageBucket: "ai-voice-platform-9adc7.firebasestorage.app",
  messagingSenderId: "911120055432",
  appId: "1:911120055432:web:c4ce88cc63acca2fa7f33d",
  measurementId: "G-4HJWVMTV99"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 2️⃣ ADD THIS LINE: Initialize and Export Auth
export const auth = getAuth(app);