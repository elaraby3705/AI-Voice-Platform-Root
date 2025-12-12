// src/layouts/MainLayout.jsx
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-grow">
                {children}
            </main>

            <Footer />
        </div>
    );
};

export default MainLayout;