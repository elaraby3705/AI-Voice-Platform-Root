// src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import { Mic, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // TEMPORARY: We will replace this with real AuthContext later
    const isAuth = false;

    return (
        <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-400 hover:text-blue-300 transition">
                        <Mic className="w-6 h-6" />
                        <span>VoiceAI</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        {isAuth ? (
                            <>
                                <Link to="/dashboard" className="text-slate-300 hover:text-white transition font-medium">Dashboard</Link>
                                <button className="flex items-center gap-2 text-red-400 hover:text-red-300 transition">
                                    <LogOut className="w-4 h-4" /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-slate-300 hover:text-white transition font-medium">Login</Link>
                                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium shadow-lg shadow-blue-500/20">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-slate-300 hover:text-white"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-slate-800 border-t border-slate-700 py-4">
                    <div className="container mx-auto px-4 flex flex-col gap-4">
                        {isAuth ? (
                            <>
                                <Link to="/dashboard" className="text-slate-300 hover:text-white">Dashboard</Link>
                                <button className="text-red-400 hover:text-red-300 text-left">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-slate-300 hover:text-white">Login</Link>
                                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-bold">Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;