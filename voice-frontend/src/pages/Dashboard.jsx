import { 
    Zap, Loader2, Mic, ShieldCheck, Server, Clock, BarChart3, ChevronRight, Activity, Cpu 
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealTimeProjects } from '../hooks/useRealTimeProjects';
import api from '../api/axios';
import NexusInterface from '../components/voice/NexusInterface';
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
        <div className="flex min-h-screen bg-[#020202] text-slate-200 selection:bg-indigo-500/30">
            <main className="flex-1 p-8 lg:p-12 max-w-[1600px] mx-auto">
                
                {/* Header Section */}
                <header className="mb-12 flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Nexus Control</h1>
                        <p className="text-slate-500 font-medium">Welcome back, {displayUser}. Systems are nominal.</p>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className={`flex items-center gap-2 border rounded-full px-4 py-2 ${connectionStatus === 'Open' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-amber-500/20'}`}>
                            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'Open' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                            <span className="text-xs font-semibold tracking-wider uppercase">
                                {connectionStatus === 'Open' ? 'Live Stream Active' : 'Polling Sync'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <KpiCard title="Active Projects" value={Array.isArray(projects) ? projects.length : 0} color="text-indigo-400" icon={Zap} />
                    <KpiCard title="System Load" value="42%" color="text-blue-400" icon={Cpu} />
                    <KpiCard title="Uptime" value="99.9%" color="text-emerald-400" icon={ShieldCheck} />
                    <KpiCard title="Latency" value="24ms" color="text-purple-400" icon={Activity} />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Chart Panel */}
                    <div className="lg:col-span-2 bg-[#080808] border border-white/5 rounded-3xl p-8 hover:border-indigo-500/20 transition-all">
                        <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-indigo-400" /> Throughput Analytics
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[{v:10}, {v:30}, {v:20}, {v:50}, {v:40}, {v:60}]}>
                                    <Tooltip contentStyle={{backgroundColor: '#050505', border: '1px solid #333'}} />
                                    <Area type="monotone" dataKey="v" stroke="#6366f1" fill="url(#colorV)" strokeWidth={2} />
                                    <defs>
                                        <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Access / Voice Status */}
                    <div className="bg-[#080808] border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-4">Voice Engine</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                                    <span className="text-xs text-slate-400">Current Model</span>
                                    <span className="text-xs font-bold text-white">GPT-4o-Audio</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                                    <span className="text-xs text-slate-400">Status</span>
                                    <span className="text-xs font-bold text-emerald-400">Ready</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsVoiceOpen(true)} className="w-full mt-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold flex items-center justify-center gap-2 transition-all">
                            <Mic className="w-4 h-4" /> Start Nexus Session
                        </button>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="mt-8 bg-[#080808] border border-white/5 rounded-3xl p-8">
                    <h3 className="text-sm font-semibold text-white mb-6">Recent Project Deployments</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="text-slate-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                                <tr>
                                    <th className="pb-4 text-left">Project Name</th>
                                    <th className="pb-4 text-left">Created At</th>
                                    <th className="pb-4 text-left">Status</th>
                                    <th className="pb-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? <tr><td colSpan="4" className="py-10 text-center"><Loader2 className="animate-spin w-6 h-6 mx-auto text-indigo-500" /></td></tr> : 
                                 Array.isArray(projects) && projects.length > 0 ? (
                                    projects.map(p => (
                                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-4 text-sm font-medium">{p.name || p.title}</td>
                                            <td className="py-4 text-xs text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                                            <td className="py-4"><span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-bold">Deployed</span></td>
                                            <td className="py-4"><ChevronRight className="w-4 h-4 text-slate-600" /></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="py-10 text-center text-slate-500 text-sm italic">No projects found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <NexusInterface isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
        </div>
    );
};

const KpiCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-[#080808] border border-white/5 p-6 rounded-3xl flex items-center justify-between hover:border-white/10 transition-all">
        <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{title}</div>
            <div className="text-2xl font-bold tracking-tight">{value}</div>
        </div>
        <div className={`p-3 rounded-2xl bg-white/5 ${color}`}><Icon className="w-6 h-6" /></div>
    </div>
);

export default Dashboard;
