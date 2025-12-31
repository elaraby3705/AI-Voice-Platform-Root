// src/components/Preloader.jsx
import { useEffect, useState } from 'react';

const Preloader = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setExiting(true), 200);
                    setTimeout(onComplete, 1000);
                    return 100;
                }
                // Slightly faster boot speed
                return prev + Math.floor(Math.random() * 5) + 1;
            });
        }, 40);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${exiting ? 'opacity-0 scale-105 filter blur-lg' : 'opacity-100'}`}>

            {/* 🌀 Background Ambient Glow (Kept Indigo for contrast) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.1),transparent_70%)] pointer-events-none" />

            {/* 📊 Voice Waveform */}
            <div className="flex items-center gap-1.5 h-20 mb-8 relative z-10">
                {[...Array(7)].map((_, i) => (
                    <div
                        key={i}
                        // Kept the wave indigo/purple to contrast with the yellow text
                        className="w-2.5 bg-gradient-to-t from-indigo-600 via-purple-900 to-indigo-900 rounded-full animate-wave shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                        style={{
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: `${0.8 + Math.random() * 0.5}s`
                        }}
                    />
                ))}
            </div>

            {/* 📝 Brand Text with "Dark Yellow" Shine */}
            <div className="relative z-10 text-center">
                <h1 className="text-3xl font-bold text-white tracking-[0.3em] uppercase mb-2 relative overflow-hidden group">
                    <span className="relative z-10">VoiceAI</span>
                    {/* 👇 CHANGED: The flash is now a dark yellow/gold (yellow-600/50) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                </h1>

                <div className="font-mono text-indigo-500/80 text-xs tracking-widest flex items-center gap-2 justify-center">
                    <span>SYSTEM BOOT</span>
                    <span className="inline-block w-8 text-right">{progress}%</span>
                </div>
            </div>

            <style>{`
                @keyframes wave {
                    0%, 100% { height: 15%; opacity: 0.3; }
                    50% { height: 100%; opacity: 1; transform: scaleY(1.2); }
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

export default Preloader;