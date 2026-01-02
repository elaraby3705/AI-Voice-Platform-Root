import { useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// Layout & Components
import MainLayout from './layouts/MainLayout';
import Preloader from './components/Preloader';

// Import Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Studio from './pages/Studio';
// Add other pages imports here as needed

// 🧠 Smart Layout Wrapper
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const appPaths = ['/dashboard', '/studio', '/settings', '/projects', '/billing'];
  const isAppPage = appPaths.some(path => location.pathname.startsWith(path));

  return isAppPage ? (
    <div className="bg-[#050505] min-h-screen text-white">{children}</div>
  ) : (
    <MainLayout>{children}</MainLayout>
  );
};

const AppRoutes = () => {
  return (
    <LayoutWrapper>
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center bg-black text-indigo-500">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* App Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/studio" element={<Studio />} />
        </Routes>
      </Suspense>
    </LayoutWrapper>
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <BrowserRouter>
      {loading ? (
        <Preloader onComplete={() => setLoading(false)} />
      ) : (
        <div className="animate-app-entry">
          <AuthProvider>
            <AppRoutes />
            <Toaster position="top-right" />
          </AuthProvider>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;