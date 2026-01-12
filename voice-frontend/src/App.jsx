import { useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// Layout & Components
import MainLayout from './layouts/MainLayout';
import Preloader from './components/Preloader';

// Import Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Studio from './pages/Studio';
import Contact from './pages/Contact';
import Developers from './pages/Developers';
import NotFound from './pages/NotFound';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import Projects from './pages/Projects';
import VoiceSessions from './pages/VoiceSessions';
import Support from './pages/Support';
import Profile from './pages/Profile'; // Kept this single import

// 🧠 Smart Layout Wrapper
const LayoutWrapper = ({ children }) => {
  const location = useLocation();

  // 1. App Pages (Dashboard Sidebar Layout)
  const appPaths = [
    '/dashboard', '/studio', '/settings', '/projects',
    '/billing', '/voicesessions', '/developers', '/support'
  ];

  // 2. Full Screen Pages (No Navbar, No Footer)
  const fullScreenPaths = ['/login', '/register', '/notfound'];

  const isAppPage = appPaths.some(path => location.pathname.startsWith(path));
  const isFullScreen = fullScreenPaths.some(path => location.pathname.startsWith(path));

  // CASE 1: Dashboard App
  if (isAppPage) {
    return <div className="bg-[#050505] min-h-screen text-white">{children}</div>;
  }

  // CASE 2: Auth or 404 (Full Screen)
  if (isFullScreen) {
    return <>{children}</>;
  }

  // CASE 3: Public Website (Landing, Contact)
  return <MainLayout>{children}</MainLayout>;
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
          {/* --- Public Website --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/contact" element={<Contact />} />

          {/* --- Full Screen Auth & Errors --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- Dashboard App --- */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/voicesessions" element={<VoiceSessions />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/developers" element={<Developers />} />
          <Route path="/support" element={<Support />} />

          {/* ✅ Path corrected for consistency */}
          <Route path="/dashboard/profile" element={<Profile />} />

          {/* --- 404 Handling --- */}
          <Route path="/notfound" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/notfound" replace />} />
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
            <Toaster position="top-right" toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
                fontSize: '14px',
              },
            }}/>
          </AuthProvider>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;