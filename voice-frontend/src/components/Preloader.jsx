import { useEffect, useState } from 'react';

const Preloader = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        // 1. Simulate Loading Progress (0 to 100%)
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);

                    // Start Exit Sequence
                    setTimeout(() => setExiting(true), 200);
                    setTimeout(onComplete, 1000); // Complete after fade out
                    return 100;
                }
                // Randomize speed for realism
                return prev + Math.floor(Math.random() * 5) + 1;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${exiting ? 'opacity-0 scale-105 filter blur-sm' : 'opacity-100'}`}>

            {/* 🌀 Background Ambient Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none animate-pulse" />

            {/* 📊 Voice Waveform (7 Bars for more detail) */}
            <div className="flex items-center gap-1.5 h-20 mb-8 relative z-10">
                {[...Array(7)].map((_, i) => (
                    <div
                        key={i}
                        className="w-2.5 bg-gradient-to-t from-indigo-600 via-purple-500 to-white rounded-full animate-wave shadow-[0_0_15px_rgba(99,102,241,0.6)]"
                        style={{
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: `${0.8 + Math.random() * 0.5}s` // Random speeds
                        }}
                    />
                ))}
            </div>

            {/* 📝 Brand Text with "Shine" Effect */}
            <div className="relative z-10 text-center">
                <h1 className="text-3xl font-bold text-white tracking-[0.3em] uppercase mb-2 relative overflow-hidden group">
                    <span className="relative z-10">VoiceAI</span>
                    {/* Shine overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                </h1>

                {/* 🔢 Progress Counter */}
                <div className="font-mono text-indigo-400 text-xs tracking-widest flex items-center gap-2 justify-center">
                    <span>SYSTEM BOOT</span>
                    <span className="inline-block w-8 text-right">{progress}%</span>
                </div>
            </div>

            {/* --- CSS ANIMATIONS --- */}
            <style>{`
                @keyframes wave {
                    0%, 100% { height: 15%; opacity: 0.3; }
                    50% { height: 100%; opacity: 1; transform: scaleY(1.2); }
                }
                .animate-wave {
                    animation-name: wave;
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

export default Preloader;