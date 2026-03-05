import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealTimeProjects } from '../hooks/useRealTimeProjects';
import api from '../api/axios';
import NexusInterface from '../components/voice/NexusInterface';
import { 
    Activity, Cpu, Zap, FileAudio, Loader2, Mic, ShieldCheck 
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);

    const lastProjectCount = useRef(0);
    const displayUser = user?.email?.split('@')[0] || 'Operator';

    // WebSocket Hook Integration
    const { connectionStatus } = useRealTimeProjects((newProject) => {
        triggerUpdate(newProject);
    });

    const triggerUpdate = (newProject) => {
        setNotification(`New Project: ${newProject.name || newProject.title}`);
        setTimeout(() => setNotification(null), 5000);
        setProjects(prev => prev.some(p => p.id === newProject.id) ? prev : [newProject, ...prev]);
    };

    useEffect(() => {
        if (authLoading || !user) return;

        const fetchProjects = async (isPolling = false) => {
            try {
                const response = await api.get('/projects/');
                const data = response.data;
                if (isPolling && data.length > lastProjectCount.current && lastProjectCount.current !== 0) {
                    setNotification(`Sync: ${data[0].name || data[0].title}`);
                    setTimeout(() => setNotification(null), 4000);
                }
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
        <div className="flex min-h-screen bg-[#050505] text-white">
            <main className="flex-1 p-10">
                {notification && (
                    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 px-6 py-3 rounded-full shadow-lg border border-indigo-400/30 flex items-center gap-3">
                        <Zap className="w-4 h-4 animate-pulse" />
                        <span className="font-bold text-sm">{notification}</span>
                    </div>
                )}

                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">System Overview</h1>
                        <p className="text-slate-400 text-sm">Welcome, {displayUser}.</p>
                    </div>
                    <div className={`border rounded-full px-4 py-1.5 ${connectionStatus === 'Open' ? 'border-emerald-500/20' : 'border-amber-500/20'}`}>
                        <span className={`text-xs ${connectionStatus === 'Open' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {connectionStatus === 'Open' ? 'Socket Active' : 'Polling Active'}
                        </span>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="col-span-2 bg-[#0A0A0A] border border-white/10 rounded-3xl p-6">
                        <h3 className="text-sm font-bold mb-4">Throughput</h3>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[{v:10}, {v:30}, {v:20}]}>
                                    <Area type="monotone" dataKey="v" stroke="#6366f1" fill="#6366f120" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="col-span-1 space-y-4">
                        <KpiCard title="Total Projects" value={projects.length} color="text-indigo-400" icon={Zap} />
                        <KpiCard title="System Status" value="Online" color="text-emerald-400" icon={ShieldCheck} />
                    </div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6">
                    {loading ? <Loader2 className="animate-spin text-indigo-500" /> : (
                        <table className="w-full text-left">
                            <tbody>
                                {projects.map(p => (
                                    <tr key={p.id} className="border-b border-white/5">
                                        <td className="py-3">{p.name || p.title}</td>
                                        <td className="py-3 text-emerald-400 text-xs">Ready</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            <button onClick={() => setIsVoiceOpen(true)} className="fixed bottom-8 right-8 bg-indigo-600 p-4 rounded-full shadow-xl">
                <Mic className="w-6 h-6" />
            </button>
            <NexusInterface isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
        </div>
    );
};

const KpiCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-[#0A0A0A] border border-white/10 p-5 rounded-3xl flex justify-between items-center">
        <div>
            <div className="text-[10px] text-slate-500 uppercase">{title}</div>
            <div className="text-xl font-bold">{value}</div>
        </div>
        <div className={`p-3 rounded-xl bg-white/5 ${color}`}><Icon className="w-5 h-5" /></div>
    </div>
);

export default Dashboard;
