import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
// Pages Import
import LandingPage from './pages/LandingPage';

// 1️⃣ Internal Route Configuration
const AppRoutes = () => {
  return (
    <MainLayout>
        <Routes>
          {/* 🏠 The Home Page is now clean and imported */}
          <Route path="/" element={<LandingPage />} />

          {/* 🔐 Auth & Protected Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<div className="text-center pt-40 text-slate-400 font-mono">New User Registration Loading...</div>} />
          <Route path="/dashboard" element={<div className="text-center pt-40 text-slate-400 font-mono">Restricted Area: Dashboard</div>} />
        </Routes>
    </MainLayout>
  );
};

// 2️⃣ Main App Entry Point
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
            position="top-right"
            toastOptions={{
                style: {
                    background: '#0f172a',
                    color: '#e2e8f0',
                    border: '1px solid #1e293b',
                },
            }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;