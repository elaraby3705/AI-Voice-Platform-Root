// src/pages/LandingPage.jsx
import { Play, ArrowRight, Activity } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="flex flex-col items-center pt-20">

            {/* 🚀 Announcement Pill */}
            <div className="mb-8 animate-fade-in">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-indigo-400 font-bold hover:bg-white/10 cursor-pointer transition">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    System Online v2.4
                </span>
            </div>

            {/* 💥 Main Headline */}
            <h1 className="text-6xl md:text-8xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-500 mb-8 tracking-tighter max-w-5xl">
                The future sounds <br/>
                like <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Humanity.</span>
            </h1>

            {/* 📝 Subtext */}
            <p className="text-slate-400 text-lg md:text-xl text-center max-w-2xl mb-12 leading-relaxed">
                Deploy high-fidelity voice agents in seconds.
                <span className="text-slate-300"> 99.9% uptime.</span>
                <span className="text-slate-300"> Sub-50ms latency.</span>
                <span className="text-slate-300"> Infinite scale.</span>
            </p>

            {/* 🎛️ Action Buttons */}
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto px-6">
                <button className="w-full md:w-auto group relative px-8 py-4 bg-white text-black rounded-xl font-bold text-sm hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all">
                    <span className="flex items-center justify-center gap-2">
                        Get API Keys <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                </button>
                <button className="w-full md:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                    <Play className="w-4 h-4 fill-current" /> Listen to Demo
                </button>
            </div>

            {/* 📊 Tech Visualization */}
            <div className="mt-20 w-full max-w-4xl border border-white/10 rounded-xl bg-black/40 backdrop-blur-md p-6 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition duration-500" />

                 <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                    <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
                        <Activity className="w-3 h-3" /> Live Session: #8392-A
                    </div>
                 </div>

                 <div className="space-y-3 font-mono text-xs">
                    <div className="flex gap-4 text-slate-400">
                        <span className="text-indigo-400">{`>`}</span>
                        <span>Initializing core systems... <span className="text-green-400">OK</span></span>
                    </div>
                    <div className="flex gap-4 text-slate-400">
                        <span className="text-indigo-400">{`>`}</span>
                        <span>Loading voice model [Polyglot-V3]... <span className="text-green-400">DONE</span></span>
                    </div>
                    <div className="flex gap-4 text-slate-400">
                        <span className="text-indigo-400">{`>`}</span>
                        <span className="animate-pulse">Listening for input...</span>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default LandingPage;