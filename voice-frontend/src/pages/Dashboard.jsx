import { useAuth } from '../context/AuthContext'; // Or '../hooks/useAuth' depending on your folder structure
import { useNavigate } from 'react-router-dom';
import {
    Activity,
    Mic,
    Zap,
    Settings,
    LogOut,
    Plus,
    CreditCard,
    BarChart3
} from 'lucide-react';

const Dashboard = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    // Extract username from email (e.g., "human" from "human@example.com")
    const username = currentUser?.email?.split('@')[0] || 'Commander';

    return (
        <div className="min-h-screen pt-24 px-4 md:px-8 pb-10">

            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Command Center
                    </h1>
                    <p className="text-slate-400 font-mono text-xs mt-1 uppercase tracking-widest">
                        OPERATOR: <span className="text-indigo-400">{username}</span> // STATUS: ONLINE
                    </p>
                </div>

                <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 text-sm font-medium">
                        <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2 text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" /> Disconnect
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8">

                {/* 2. Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: API Usage */}
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity className="w-16 h-16 text-indigo-500" />
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                                <Activity className="w-5 h-5" />
                            </div>
                            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">System Latency</span>
                        </div>
                        <div className="text-3xl font-bold text-white">42ms</div>
                        <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                            <Zap className="w-3 h-3 fill-current" /> Optimized
                        </div>
                    </div>

                    {/* Card 2: Voice Clones */}
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Mic className="w-16 h-16 text-purple-500" />
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                                <Mic className="w-5 h-5" />
                            </div>
                            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">Active Voices</span>
                        </div>
                        <div className="text-3xl font-bold text-white">3</div>
                        <div className="text-xs text-slate-500 mt-2">
                            / 5 slots used
                        </div>
                    </div>

                    {/* Card 3: Credits */}
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CreditCard className="w-16 h-16 text-emerald-500" />
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">Credits</span>
                        </div>
                        <div className="text-3xl font-bold text-white">$24.00</div>
                        <div className="text-xs text-slate-500 mt-2">
                            Auto-refill: OFF
                        </div>
                    </div>
                </div>

                {/* 3. Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Recent Projects Table (Takes up 2 columns) */}
                    <div className="lg:col-span-2 bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-white">Recent Syntheses</h3>
                            <button className="text-xs text-indigo-400 hover:text-indigo-300 font-mono">VIEW LOGS</button>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs font-mono text-slate-500 border-b border-white/5">
                                        <th className="p-4 font-normal">PROJECT NAME</th>
                                        <th className="p-4 font-normal">VOICE MODEL</th>
                                        <th className="p-4 font-normal">DURATION</th>
                                        <th className="p-4 font-normal text-right">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    <tr className="group hover:bg-white/5 transition-colors border-b border-white/5">
                                        <td className="p-4 text-white font-medium">Project Nexus Intro</td>
                                        <td className="p-4 text-slate-400 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500" /> Sarah (Pro)
                                        </td>
                                        <td className="p-4 text-slate-400 font-mono">0:42s</td>
                                        <td className="p-4 text-right">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                                                Ready
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="group hover:bg-white/5 transition-colors border-b border-white/5">
                                        <td className="p-4 text-white font-medium">Marketing V2</td>
                                        <td className="p-4 text-slate-400 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-purple-500" /> Adam (Legacy)
                                        </td>
                                        <td className="p-4 text-slate-400 font-mono">1:15s</td>
                                        <td className="p-4 text-right">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                                                Ready
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="group hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-white font-medium">Audiobook Chapter 1</td>
                                        <td className="p-4 text-slate-400 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500" /> Sarah (Pro)
                                        </td>
                                        <td className="p-4 text-slate-400 font-mono">--:--</td>
                                        <td className="p-4 text-right">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-bold uppercase tracking-wider border border-yellow-500/20">
                                                Processing
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Actions Column */}
                    <div className="space-y-4">
                        <div className="bg-gradient-to-b from-indigo-600 to-indigo-800 rounded-2xl p-6 relative overflow-hidden group cursor-pointer shadow-lg shadow-indigo-900/20">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <Plus className="w-24 h-24 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">New Synthesis</h3>
                            <p className="text-indigo-200 text-sm mb-6">Create lifelike audio from text.</p>
                            <button className="w-full py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Create Now
                            </button>
                        </div>

                        <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-indigo-400" /> Usage Trend
                            </h3>
                            {/* Simple CSS Bar Chart Visualization */}
                            <div className="flex items-end justify-between h-24 gap-2">
                                <div className="w-full bg-white/5 rounded-t-sm h-[30%] hover:bg-indigo-500 transition-colors"></div>
                                <div className="w-full bg-white/5 rounded-t-sm h-[50%] hover:bg-indigo-500 transition-colors"></div>
                                <div className="w-full bg-white/5 rounded-t-sm h-[40%] hover:bg-indigo-500 transition-colors"></div>
                                <div className="w-full bg-white/5 rounded-t-sm h-[80%] hover:bg-indigo-500 transition-colors"></div>
                                <div className="w-full bg-indigo-500 rounded-t-sm h-[65%] relative group">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        Today
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;