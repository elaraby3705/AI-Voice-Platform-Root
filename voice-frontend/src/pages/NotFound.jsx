import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, RefreshCcw, WifiOff } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050505] text-white">

            {/* --- 1. Cyber Grid Background (Pure CSS) --- */}
            <div className="absolute inset-0 z-0 opacity-20"
                 style={{
                     backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
                     backgroundSize: '40px 40px',
                     maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
                     WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)' // Fades edges
                 }}>
            </div>

            {/* --- 2. Ambient Glow Effects --- */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[128px] pointer-events-none" />

            <div className="relative z-10 text-center max-w-2xl px-6">

                {/* --- 3. The Radar / Glitch Visual --- */}
                <div className="relative flex items-center justify-center mb-10">
                    {/* Outer Rings */}
                    <div className="absolute w-40 h-40 border border-white/10 rounded-full animate-[ping_3s_linear_infinite]" />
                    <div className="absolute w-60 h-60 border border-white/5 rounded-full animate-[ping_4s_linear_infinite_1s]" />

                    {/* Center Icon */}
                    <div className="relative w-24 h-24 bg-[#0A0A0A] border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 backdrop-blur-xl group">
                        <WifiOff className="w-10 h-10 text-slate-500 group-hover:text-rose-500 transition-colors duration-500" />

                        {/* Glitch Overlay Text */}
                        <div className="absolute -bottom-12 font-mono text-xs text-rose-500 font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity animate-bounce">
                            CONNECTION_LOST
                        </div>
                    </div>
                </div>

                {/* --- 4. Typography --- */}
                <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-600 tracking-tighter mb-4 select-none">
                    404
                </h1>

                <h2 className="text-2xl font-bold text-white mb-4">
                    Sector Not Found
                </h2>

                <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                    The requested coordinates exist outside the known neural network.
                    The data stream may have been severed.
                </p>

                {/* --- 5. Action Buttons --- */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-medium hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </button>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Return to Base
                    </button>
                </div>

                {/* --- 6. Footer Decoration --- */}
                <div className="mt-16 flex items-center justify-center gap-2 opacity-30">
                    <div className="h-px w-12 bg-white"></div>
                    <span className="text-[10px] font-mono tracking-[0.2em] text-white uppercase">System Halted</span>
                    <div className="h-px w-12 bg-white"></div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;