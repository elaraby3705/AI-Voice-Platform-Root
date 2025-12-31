import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4 relative overflow-hidden">

            {/* Background Glitch Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black pointer-events-none" />

            <div className="relative z-10 text-center space-y-8 max-w-lg">

                {/* Error Icon */}
                <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center relative">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                        <div className="absolute inset-0 border border-red-500/30 rounded-full animate-ping opacity-20" />
                    </div>
                </div>

                {/* Main Text */}
                <div>
                    <h1 className="text-8xl font-bold font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-800">
                        404
                    </h1>
                    <h2 className="text-xl text-red-400 font-mono uppercase tracking-widest mt-2 border-y border-red-500/10 py-2">
                        Signal Lost
                    </h2>
                </div>

                {/* Description */}
                <p className="text-slate-400 leading-relaxed">
                    The requested frequency coordinates could not be located in the neural network. The page may have been moved, deleted, or never existed.
                </p>

                {/* Terminal Code Snippet */}
                <div className="bg-black/50 border border-white/10 rounded-lg p-4 font-mono text-xs text-left text-slate-500">
                    <div className="flex gap-2">
                        <span className="text-red-500">{`>`}</span>
                        <span>ERROR_CODE: PAGE_NOT_FOUND</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-red-500">{`>`}</span>
                        <span>TRACE: /null/void/undefined</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-red-500">{`>`}</span>
                        <span className="animate-pulse">Re-establishing connection...</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                    >
                        <ArrowLeft className="w-4 h-4" /> Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 rounded-xl bg-white text-black hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm font-bold shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                    >
                        <Home className="w-4 h-4" /> Return Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;