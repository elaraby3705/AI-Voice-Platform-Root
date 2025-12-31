// src/App.jsx
import { useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// Layout & Components
import MainLayout from './layouts/MainLayout';
import Preloader from './components/Preloader';

// ✅ Clean Import (Importing from the index.js barrel)
import * as Pages from './pages';

const AppRoutes = () => {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center bg-black text-indigo-500">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Pages.LandingPage />} />
          <Route path="/login" element={<Pages.Login />} />
          <Route path="/register" element={<Pages.Register />} />
          <Route path="/contact" element={<Pages.Contact />} />
          <Route path="/support" element={<Pages.Support />} />

          {/* Protected/App Routes */}
          <Route path="/dashboard" element={<Pages.Dashboard />} />
          <Route path="/projects" element={<Pages.Projects />} />
          <Route path="/studio" element={<Pages.Studio />} />
          <Route path="/developers" element={<Pages.Developers />} />
          <Route path="/billing" element={<Pages.Billing />} />
          <Route path="/settings" element={<Pages.Settings />} />

          {/* 404 Route */}
          <Route path="*" element={<Pages.NotFound />} />
        </Routes>
      </Suspense>
    </MainLayout>
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <BrowserRouter>
      {loading ? (
        // 1. The Preloader (Handles its own fade-out)
        <Preloader onComplete={() => setLoading(false)} />
      ) : (
        // 2. The App (Wrapped to fade IN smoothly)
        // ✅ This <div> is the magic that stops the white flash
        <div className="animate-app-entry">
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
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;