import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-black text-slate-300 relative overflow-x-hidden selection:bg-indigo-500/30">

            {/* 🕸️ Background Matrix */}
            <div className="fixed inset-0 z-0">
                {/* 1. The Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* 2. The Spotlight (Glow from top center) */}
                <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-full rounded-full bg-indigo-500/10 blur-[120px]" />

                {/* 3. The Noise Texture (Film Grain) */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-grow pt-32 pb-20 px-6">
                    {children}
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default MainLayout;