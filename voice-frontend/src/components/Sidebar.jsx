import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Mic, Layers, Code2, Settings,
    CreditCard, LifeBuoy, LogOut, ChevronDown,
    Zap, HardDrive, Command
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const location = useLocation();

    // Logic to extract name from email (since backend sends email only)
    const displayName = user?.email?.split('@')[0] || 'Operator';
    const initial = displayName.charAt(0).toUpperCase();

    const isActive = (path) => location.pathname === path;

    const NavItem = ({ to, icon: Icon, label, badge }) => (
        <Link
            to={to}
            className={`group flex items-center justify-between px-3 py-2 rounded-lg mb-1 transition-all duration-200 border border-transparent ${
                isActive(to)
                ? "bg-white/[0.08] text-white border-white/[0.05]"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
            }`}
        >
            <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive(to) ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                <span className="text-sm font-medium tracking-tight">{label}</span>
            </div>
            {badge && (
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20 font-bold uppercase tracking-wider">
                    {badge}
                </span>
            )}
        </Link>
    );

    return (
        <aside className="w-64 bg-[#050505] border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 z-50">

            {/* --- Workspace Switcher --- */}
            <div className="p-4">
                <button className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors border border-white/10 group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/20 text-white">
                            <Command className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                            <div className="text-xs font-bold text-white leading-none mb-1 group-hover:text-indigo-200 transition-colors">Voice AI Pro</div>
                            <div className="text-[10px] text-slate-500 font-mono">Team Enterprise</div>
                        </div>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                </button>
            </div>

            {/* --- Navigation --- */}
            <nav className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide">
                <div className="mb-8">
                    <div className="px-3 mb-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono flex items-center gap-2">
                        Platform
                    </div>
                    <NavItem to="/dashboard" icon={LayoutDashboard} label="Command Center" />
                    <NavItem to="/studio" icon={Mic} label="AI Studio" badge="V2" />
                    <NavItem to="/projects" icon={Layers} label="Projects" />
                </div>

                <div className="mb-8">
                    <div className="px-3 mb-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">
                        Developers
                    </div>
                    <NavItem to="/api" icon={Code2} label="API Keys" />
                    <NavItem to="/webhooks" icon={Zap} label="Webhooks" />
                </div>

                <div>
                    <div className="px-3 mb-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">
                        Settings
                    </div>
                    <NavItem to="/billing" icon={CreditCard} label="Billing" />
                    <NavItem to="/settings" icon={Settings} label="Preferences" />
                    <NavItem to="/support" icon={LifeBuoy} label="Support" />
                </div>
            </nav>

            {/* --- Footer Status --- */}
            <div className="p-4 bg-black/40 border-t border-white/5 backdrop-blur-sm">

                {/* Storage Meter */}
                <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                            <HardDrive className="w-3 h-3" /> Storage
                        </span>
                        <span className="text-[10px] text-indigo-400 font-mono font-bold">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-[75%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    </div>
                </div>

                {/* User Profile */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300 ring-2 ring-black">
                            {initial}
                        </div>
                        <div className="overflow-hidden max-w-[100px]">
                            {/* FIXED LINE BELOW */}
                            <div className="text-xs font-bold text-white truncate" title={user?.email}>
                                {displayName}
                            </div>
                            <div className="text-[9px] text-emerald-500 truncate flex items-center gap-1 font-medium">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online
                            </div>
                        </div>
                    </div>
                    {/* Logout Button */}
                    <button onClick={logout} className="text-slate-600 hover:text-rose-400 transition-colors p-2 hover:bg-white/5 rounded-lg" title="Sign Out">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;