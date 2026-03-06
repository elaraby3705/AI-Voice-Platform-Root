import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealTimeProjects } from '../hooks/useRealTimeProjects';
import api from '../api/axios';
import NexusInterface from '../components/voice/NexusInterface';
import { 
    Zap, Loader2, Mic, ShieldCheck, Server, Clock, BarChart3, ChevronRight, Activity, Cpu 
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

const Dashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);

    const lastProjectCount = useRef(0);
    const displayUser = user?.email?.split('@')[0] || 'Operator';

    const { connectionStatus } = useRealTimeProjects((newProject) => {
        triggerUpdate(newProject);
    });

    const triggerUpdate = (newProject) => {
        if (!newProject) return;
        setNotification(`Live Sync: ${newProject.name || 'New Process'}`);
        setTimeout(() => setNotification(null), 4000);
        setProjects(prev => {
            const list = Array.isArray(prev) ? prev : [];
            return list.some(p => p.id === newProject.id) ? list : [newProject, ...list];
        });
    };

    useEffect(() => {
        if (authLoading || !user) return;

        const fetchProjects = async (isPolling = false) => {
            try {
                const response = await api.get('/projects/');
                const data = Array.isArray(response.data) ? response.data : [];
                setProjects(data);
                lastProjectCount.current = data.length;
            } catch (error) {
                console.error("Fetch failed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
        const pollInterval = setInterval(() => fetchProjects(true), 5000);
        return () => clearInterval(pollInterval);
    }, [user, authLoading]);

    return (
        <div className="min-h-screen bg-[#020202] text-slate-300 font-sans p-6 lg:p-12">
            <main className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Nexus Control</h1>
                        <p className="text-slate-500 text-sm mt-1">Operator: {displayUser} • System Status: Nominal</p>
                    </div>
                    <div className="flex items-center gap-3 bg-[#0a0a0a] border border-white/5 rounded-full px-4 py-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Sync Active</span>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { title: "Active Projects", val: Array.isArray(projects) ? projects.length : 0, icon: Zap },
                        { title: "System Load", val: "42%", icon: Cpu },
                        { title: "Uptime", val: "99.9%", icon: ShieldCheck },
                        { title: "Latency", val: "24ms", icon: Activity }
                    ].map((item, i) => (
                        <div key={i} className="bg-[#0a0a0a] border border-white/5 p-5 rounded-2xl">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">{item.title}</span>
                                <item.icon className="w-4 h-4 text-slate-700" />
                            </div>
                            <div className="text-2xl font-semibold text-white">{item.val}</div>
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl">
                         <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Throughput Analytics</h3>
                         <div className="h-[250px] w-full">
                            <ResponsiveContainer>
                                <AreaChart data={[{v:10}, {v:35}, {v:25}, {v:60}]}>
                                    <Area type="monotone" dataKey="v" stroke="#4f46e5" fill="url(#grad)" strokeWidth={3} />
                                    <defs>
                                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.2}/>
                                            <stop offset="100%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                </AreaChart>
                            </ResponsiveContainer>
                         </div>
                    </div>

                    <div className="bg-gradient-to-b from-indigo-900/20 to-[#0a0a0a] border border-indigo-500/10 p-6 rounded-3xl flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Voice Engine Core</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between py-3 border-b border-white/5">
                                    <span className="text-xs text-slate-500">Model</span>
                                    <span className="text-xs font-mono text-indigo-300">GPT-4o-Audio</span>
                                </div>
                                <div className="flex justify-between py-3">
                                    <span className="text-xs text-slate-500">Node Status</span>
                                    <span className="text-xs font-bold text-emerald-500">ONLINE</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsVoiceOpen(true)} className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
                            Initialize Session
                        </button>
                    </div>
                </div>
            </main>
            <NexusInterface isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
        </div>
    );
};

export default Dashboard;
