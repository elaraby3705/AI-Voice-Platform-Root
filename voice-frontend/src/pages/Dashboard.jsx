import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    Activity, Cpu, ArrowUpRight, ArrowDownRight,
    Clock, Plus, Copy, BookOpen, ShieldCheck, Zap,
    FileAudio, Calendar, Loader2, Mic
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// 👇 IMPORTANT: Import the secure 'api' instance instead of standard 'axios'
import api from '../api/axios';
import NexusInterface from '../components/voice/NexusInterface';

const Dashboard = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Voice Modal State
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);

    const displayUser = user?.email?.split('@')[0] || 'Operator';

    // 1. Fetch Projects (Now Authenticated!)
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // 👇 CLEAN CODE: No more hardcoded http://localhost...
                // The 'api' instance handles the Base URL and the Token automatically.
                const response = await api.get('/projects/');
                setProjects(response.data);
            } catch (error) {
                console.error("Failed to fetch projects:", error);
                // Optional: setProjects([]) if error to prevent crash
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProjects();
        }
    }, [user]);

    // Mock Data for Charts
    const trafficData = [
        { time: '10:00', requests: 120 }, { time: '10:05', requests: 180 },
        { time: '10:10', requests: 150 }, { time: '10:15', requests: 290 },
        { time: '10:20', requests: 350 }, { time: '10:25', requests: 280 },
        { time: '10:30', requests: 420 },
    ];

    return (
        <div className="flex min-h-screen bg-[#050505] selection:bg-indigo-500/30 relative">
            <Sidebar />
            <main className="ml-64 flex-1 p-10 overflow-y-auto">

                {/* --- Header --- */}
                <div className="mb-10 flex justify-between items-end animate-fade-in-up">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">System Overview</h1>
                        <p className="text-slate-400 text-sm">Welcome back, <span className="text-white font-medium">{displayUser}</span>.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-full px-4 py-1.5 backdrop-blur-md">
                        <div className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        <span className="text-xs font-medium text-slate-300">System Online</span>
                        <div className="h-3 w-px bg-white/10 mx-1"></div>
                        <span className="text-xs font-mono text-slate-500">v2.4.0</span>
                    </div>
                </div>

                {/* --- Quick Actions --- */}
                <div className="grid grid-cols-4 gap-4 mb-8 animate-fade-in-up delay-100">
                    <QuickAction title="New Synthesis" icon={Plus} shortcut="N" color="indigo" />
                    <QuickAction title="Clone Voice" icon={Copy} shortcut="C" color="purple" />
                    <QuickAction title="API Docs" icon={BookOpen} shortcut="D" color="emerald" />
                    <QuickAction title="Access Tokens" icon={ShieldCheck} shortcut="T" color="slate" />
                </div>

                {/* --- Analytics Grid --- */}
                <div className="grid grid-cols-3 gap-6 mb-8 animate-fade-in-up delay-200">
                    {/* Traffic Chart */}
                    <div className="col-span-2 bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Activity className="w-4 h-4 text-indigo-500" /> Real-time Throughput
                            </h3>
                            <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20">LIVE</span>
                        </div>
                        <div className="h-[250px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trafficData}>
                                    <defs>
                                        <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                    <Area type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorReq)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="col-span-1 space-y-4">
                        <KpiCard title="API Latency" value="42ms" change="-12%" trend="down" icon={Clock} color="text-emerald-400" />
                        <KpiCard title="Total Projects" value={projects.length} change="Just now" trend="neutral" icon={Zap} color="text-indigo-400" />
                        <KpiCard title="Active Workers" value="16/24" change="Idle" trend="neutral" icon={Cpu} color="text-yellow-400" />
                    </div>
                </div>

                {/* --- Recent Projects --- */}
                <div className="grid grid-cols-1 gap-6 animate-fade-in-up delay-300">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 flex flex-col min-h-[300px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <FileAudio className="w-4 h-4 text-slate-500" /> Recent Projects
                            </h3>
                            <Link to="/projects" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View All</Link>
                        </div>

                        {loading ? (
                            <div className="flex-1 flex items-center justify-center text-slate-500">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        ) : projects.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                            <th className="pb-3 pl-2">Project Name</th>
                                            <th className="pb-3">Voice Model</th>
                                            <th className="pb-3">Created</th>
                                            <th className="pb-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs">
                                        {projects.map((project) => (
                                            <tr key={project.id} className="group hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0">
                                                <td className="py-3 pl-2 font-medium text-white flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                        <FileAudio className="w-4 h-4" />
                                                    </div>
                                                    {project.title}
                                                </td>
                                                <td className="py-3 text-slate-400">{project.voice_id}</td>
                                                <td className="py-3 text-slate-500 font-mono">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {project.created_at_formatted?.split(' ')[0]}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                                        Ready
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/5 rounded-2xl p-8">
                                <FileAudio className="w-10 h-10 mb-3 opacity-20" />
                                <p className="text-sm font-medium text-slate-400 mb-1">No projects yet</p>
                                <p className="text-xs text-slate-600 mb-4">Create your first AI voice generation to see it here.</p>
                                <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500 transition-colors">
                                    Create New Project
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </main>

            {/* 🔥 Voice Trigger Button 🔥 */}
            <button
                onClick={() => setIsVoiceOpen(true)}
                className="fixed bottom-8 right-8 group flex items-center gap-3 pl-4 pr-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-[0_0_30px_-5px_rgba(79,70,229,0.5)] transition-all duration-300 hover:scale-105 hover:-translate-y-1 z-40 border border-white/10"
            >
                <span className="text-sm font-bold tracking-wide">Talk to Nexus</span>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform">
                    <Mic className="w-5 h-5" />
                </div>
            </button>

            {/* Voice Modal Overlay */}
            <NexusInterface
                isOpen={isVoiceOpen}
                onClose={() => setIsVoiceOpen(false)}
            />

        </div>
    );
};

// --- Sub Components ---

const QuickAction = ({ title, icon: Icon, shortcut, color }) => (
    <button className="bg-[#0A0A0A] border border-white/10 p-4 rounded-2xl flex items-center justify-between group hover:border-indigo-500/50 hover:bg-white/[0.02] transition-all">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-300 text-sm group-hover:text-white">{title}</span>
        </div>
        <span className="text-[10px] font-mono text-slate-600 border border-white/10 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {shortcut}
        </span>
    </button>
);

const KpiCard = ({ title, value, change, trend, icon: Icon, color }) => (
    <div className="bg-[#0A0A0A] border border-white/10 p-5 rounded-3xl flex justify-between items-center hover:border-white/20 transition-all">
        <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{title}</div>
            <div className="text-2xl font-bold text-white">{value}</div>
        </div>
        <div className="text-right">
            <div className={`p-2 rounded-xl bg-white/5 mb-1 inline-flex ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className={`text-[10px] font-bold ${trend === 'up' ? 'text-emerald-400' : 'text-slate-400'} flex justify-end items-center gap-0.5`}>
                {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {change}
            </div>
        </div>
    </div>
);

export default Dashboard;