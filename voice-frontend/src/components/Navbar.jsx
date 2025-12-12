import { Link } from 'react-router-dom';
import { Mic, Sparkles, ChevronRight } from 'lucide-react';

const Navbar = () => {
    const isAuth = false;

    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6">
            <nav className="flex items-center gap-2 p-2 rounded-full border border-white/10 bg-black/50 backdrop-blur-2xl shadow-2xl shadow-indigo-500/10 ring-1 ring-white/5">

                {/* 🌀 Logo Area */}
                <Link to="/" className="flex items-center gap-3 pl-4 pr-6 border-r border-white/10">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-full h-full bg-indigo-500/50 blur-md rounded-full" />
                        <Mic className="relative w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="font-semibold text-white tracking-wide">
                        Voice<span className="text-indigo-400">AI</span>
                    </span>
                </Link>

                {/* 🔗 Desktop Links */}
                <div className="hidden md:flex items-center px-4 gap-1">
                    <NavLink to="/">Mission</NavLink>
                    <NavLink to="/">Technology</NavLink>
                    <NavLink to="/">Studio</NavLink>
                </div>

                {/* ⚡ Action Area */}
                <div className="pl-4 pr-2 flex items-center gap-3">
                    {isAuth ? (
                        <Link to="/dashboard" className="text-sm font-medium text-white hover:text-indigo-400">Dashboard</Link>
                    ) : (
                        <>
                            <Link to="/login" className="hidden md:block text-xs font-medium text-slate-400 hover:text-white transition">
                                Log in
                            </Link>
                            <Link to="/register" className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:bg-indigo-50 transition-colors">
                                <Sparkles className="w-3 h-3 text-indigo-600" />
                                Start Creating
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
};

// Micro-component for links with hover effect
const NavLink = ({ to, children }) => (
    <Link to={to} className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
        {children}
    </Link>
);

export default Navbar;