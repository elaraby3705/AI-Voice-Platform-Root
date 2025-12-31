import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [scrollProgress, setScrollProgress] = useState(0);

    // 🖱️ 1. Mouse Tracking Logic (for the glow effect)
    useEffect(() => {
        const handleMouseMove = (e) => {
            // We use requestAnimationFrame for smooth performance
            window.requestAnimationFrame(() => {
                setMousePos({ x: e.clientX, y: e.clientY });
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // 📜 2. Scroll Progress Logic
    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scroll = totalScroll / windowHeight;
            setScrollProgress(Number(scroll));
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-black text-slate-300 relative overflow-x-hidden selection:bg-indigo-500/30 font-sans">

            {/* 🟢 Progress Bar (Fixed at top) */}
            <div
                className="fixed top-0 left-0 h-0.5 bg-indigo-500 z-[100] transition-all duration-75 ease-out shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                style={{ width: `${scrollProgress * 100}%` }}
            />

            {/* 🕸️ Background Matrix */}
            <div className="fixed inset-0 z-0 pointer-events-none">

                {/* A. The Base Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* B. Top Spotlight (Static) */}
                <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-full rounded-full bg-indigo-500/05 blur-[120px]" />

                {/* ✨ C. Interactive Mouse Glow (The Magic) */}
                <div
                    className="absolute inset-0 transition-opacity duration-1000"
                    style={{
                        background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.1), transparent 40%)`
                    }}
                />

                {/* D. Vignette (Darkens edges to focus content) */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_40%,rgba(0,0,0,0.6)_100%)]" />

                {/* E. Noise Texture (Film Grain) */}
                <div className="absolute inset-0 opacity-[0.03]"
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                {/* Added a simple fade-in class for smoother page loads */}
                <main className="flex-grow pt-32 pb-20 px-4 md:px-8 animate-fade-in">
                    {children}
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default MainLayout;