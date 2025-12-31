import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mic, Sparkles, Menu, X, ChevronDown, Layers, Cpu, Globe, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProductDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
            <nav className="relative flex items-center gap-2 p-2 rounded-full border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl shadow-indigo-500/10 ring-1 ring-white/5 max-w-5xl w-full justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 pl-4 pr-6 border-r border-white/10">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-full h-full bg-indigo-500/50 blur-md rounded-full animate-pulse" />
                        <Mic className="relative w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="font-bold text-white tracking-wide hidden sm:block">
                        Voice<span className="text-indigo-400">AI</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-1">

                    {/* Dropdown Trigger */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                            className={`px-4 py-2 text-xs font-medium rounded-full transition-all flex items-center gap-1 ${isProductDropdownOpen ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Product <ChevronDown className={`w-3 h-3 transition-transform ${isProductDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isProductDropdownOpen && (
                            <div className="absolute top-12 left-0 w-64 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-2 animate-fade-in-up flex flex-col gap-1 overflow-hidden ring-1 ring-white/5">
                                <DropdownItem to="/studio" icon={<Layers className="w-4 h-4 text-purple-400"/>} title="Voice Studio" desc="Create custom agents" />
                                <DropdownItem to="/developers" icon={<Cpu className="w-4 h-4 text-indigo-400"/>} title="API & SDKs" desc="Integrate into your app" />
                                <DropdownItem to="/projects" icon={<Globe className="w-4 h-4 text-emerald-400"/>} title="Showcase" desc="See what others built" />
                            </div>
                        )}
                    </div>

                    <NavLink to="/mission" active={isActive('/mission')}>Mission</NavLink>
                    <NavLink to="/billing" active={isActive('/billing')}>Pricing</NavLink>
                    {currentUser && <NavLink to="/support" active={isActive('/support')}>Support</NavLink>}
                </div>

                {/* Actions */}
                <div className="pl-4 pr-2 flex items-center gap-3">
                    {currentUser ? (
                        <div className="flex items-center gap-3">
                            <Link to="/dashboard" className="hidden md:flex items-center gap-2 text-xs font-bold text-white bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-all border border-white/5">
                                <LayoutDashboard className="w-3 h-3" /> Dashboard
                            </Link>
                            <Link to="/settings" className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-black">
                                {currentUser.email[0].toUpperCase()}
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="hidden md:block text-xs font-medium text-slate-400 hover:text-white transition">Log in</Link>
                            <Link to="/register" className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:bg-slate-200 transition-colors shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)]">
                                <Sparkles className="w-3 h-3 text-indigo-600" />
                                <span className="hidden sm:inline">Start Free</span>
                                <span className="sm:hidden">Start</span>
                            </Link>
                        </>
                    )}
                    <button className="md:hidden p-2 text-slate-400" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </nav>
        </div>
    );
};

// Helper Components
const NavLink = ({ to, children, active }) => (
    <Link to={to} className={`px-4 py-2 text-xs font-medium rounded-full transition-all ${active ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
        {children}
    </Link>
);

const DropdownItem = ({ to, icon, title, desc }) => (
    <Link to={to} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
        <div className="mt-0.5 p-1.5 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">{icon}</div>
        <div>
            <div className="text-xs font-bold text-white">{title}</div>
            <div className="text-[10px] text-slate-500">{desc}</div>
        </div>
    </Link>
);

export default Navbar;