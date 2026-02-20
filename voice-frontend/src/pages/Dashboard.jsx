import { useState, useEffect, useRef } from 'react'; // Added useRef
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealTimeProjects } from '../hooks/useRealTimeProjects';
import api from '../api/axios';
import NexusInterface from '../components/voice/NexusInterface';
import {
    Activity, Cpu, ArrowUpRight, ArrowDownRight,
    Clock, Plus, Copy, BookOpen, ShieldCheck, Zap,
    FileAudio, Calendar, Loader2, Mic
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
    console.log("🚀🚀🚀 [DEBUG] Dashboard.jsx is rendering with Polling Fix! 🚀🚀🚀");

    const { user, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);

    // Use a ref to prevent notification spam during polling
    const lastProjectCount = useRef(0);

    const displayUser = user?.email?.split('@')[0] || 'Operator';

    // ==========================================
    // 1. Real-Time WebSocket (Live Update Part A)
    // ==========================================
    const { connectionStatus } = useRealTimeProjects((newProject) => {
        console.log("⚡ [Dashboard] WebSocket update received:", newProject);
        triggerUpdate(newProject);
    });

    const triggerUpdate = (newProject) => {
        setNotification(`🚀 New Project Created: ${newProject.name || newProject.title}`);
        setTimeout(() => setNotification(null), 5000);

        setProjects((prev) => {
            if (prev.some(p => p.id === newProject.id)) return prev;
            return [{
                ...newProject,
                title: newProject.name || newProject.title,
                created_at_formatted: new Date().toISOString().split('T')[0],
                voice_id: newProject.voice_id || "Voice-001"
            }, ...prev];
        });
    };

    // ==========================================
    // 2. Initial Fetch + Smart Polling (Live Update Part B)
    // ==========================================
    useEffect(() => {
        if (authLoading || !user) return;

        const fetchProjects = async (isPolling = false) => {
            try {
                const response = await api.get('/projects/');
                const data = response.data;

                // Check if a new project was added via polling (since WS is pending)
                if (isPolling && data.length > lastProjectCount.current && lastProjectCount.current !== 0) {
                    const latest = data[0];
                    setNotification(`📡 System Sync: ${latest.name || latest.title}`);
                    setTimeout(() => setNotification(null), 4000);
                }

                setProjects(data);
                lastProjectCount.current = data.length;
            } catch (error) {
                console.error("❌ [Dashboard] Fetch failed:", error);
            } finally {
                setLoading(false);
            }
        };

        // Initial load
        fetchProjects();

        // 🔄 THE FIX: Poll every 5 seconds as a fallback for the "Pending" WebSocket
        const pollInterval = setInterval(() => {
            fetchProjects(true);
        }, 5000);

        return () => clearInterval(pollInterval);
    }, [user, authLoading]);

    // ==========================================
    // 3. Mock Data & Sub-components (Unchanged)
    // ==========================================
    const trafficData = [
        { time: '10:00', requests: 120 }, { time: '10:05', requests: 180 },
        { time: '10:10', requests: 150 }, { time: '10:15', requests: 290 },
        { time: '10:20', requests: 350 }, { time: '10:25', requests: 280 },
        { time: '10:30', requests: 420 },
    ];

    // Rendering Logic
    return (
        <div className="flex min-h-screen bg-[#050505] selection:bg-indigo-500/30 relative">
            {/* Sidebar omitted for brevity - Keep yours here */}
            <main className="ml-64 flex-1 p-10 overflow-y-auto relative">

                {/* --- Live Notification Toast --- */}
                {notification && (
                    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
                        <div className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg border border-indigo-400/30 flex items-center gap-3">
                            <Zap className="w-4 h-4 animate-pulse" />
                            <span className="font-bold text-sm">{notification}</span>
                        </div>
                    </div>
                )}

                {/* --- Header & Status --- */}
                <div className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">System Overview</h1>
                        <p className="text-slate-400 text-sm">Welcome back, <span className="text-white font-medium">{displayUser}</span>.</p>
                    </div>

                    <div className={`flex items-center gap-3 border rounded-full px-4 py-1.5 transition-colors ${
                        connectionStatus === 'Open' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'
                    }`}>
                        <span className={`h-2 w-2 rounded-full ${connectionStatus === 'Open' ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'}`}></span>
                        <span className={`text-xs font-medium ${connectionStatus === 'Open' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {connectionStatus === 'Open' ? 'Socket Active' : 'Polling Active'}
                        </span>
                    </div>
                </div>

                {/* KPI & Table Logic (Using the 'projects' state updated by Polling/WS) */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="col-span-2 bg-[#0A0A0A] border border-white/10 rounded-3xl p-6">
                         {/* AreaChart logic exactly as yours... */}
                         <h3 className="text-white text-sm font-bold mb-4">Throughput</h3>
                         <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trafficData}>
                                    <Area type="monotone" dataKey="requests" stroke="#6366f1" fill="#6366f120" />
                                </AreaChart>
                            </ResponsiveContainer>
                         </div>
                    </div>
                    <div className="col-span-1 space-y-4">
                        <KpiCard title="Total Projects" value={projects.length} change="Live" icon={Zap} color="text-indigo-400" />
                        <KpiCard title="User ID" value={user?.id || "..."} change="Verified" icon={ShieldCheck} color="text-emerald-400" />
                    </div>
                </div>

                {/* Recent Projects Table - Exactly your logic, showing updated 'projects' state */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2"><FileAudio className="w-4 h-4" /> Recent Projects</h3>
                    </div>
                    {loading ? (
                         <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>
                    ) : (
                        <table className="w-full text-left">
                            <tbody className="text-xs">
                                {projects.map((p) => (
                                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                        <td className="py-3 text-white font-medium capitalize">{p.name || p.title}</td>
                                        <td className="py-3 text-slate-500">{p.voice_id || "Standard"}</td>
                                        <td className="py-3 text-right">
                                            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full text-[10px]">Ready</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* --- Voice Assistant Trigger --- */}
            <button
                onClick={() => setIsVoiceOpen(true)}
                className="fixed bottom-8 right-8 flex items-center gap-3 pl-4 pr-2 py-2 bg-indigo-600 rounded-full shadow-xl hover:scale-105 transition-all z-40"
            >
                <span className="text-sm font-bold">Talk to Nexus</span>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Mic className="w-5 h-5" />
                </div>
            </button>

            <NexusInterface isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
        </div>
    );
};

// Sub-components (Keep your existing QuickAction and KpiCard definitions here)
const KpiCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-[#0A0A0A] border border-white/10 p-5 rounded-3xl flex justify-between items-center">
        <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">{title}</div>
            <div className="text-2xl font-bold text-white">{value}</div>
        </div>
        <div className={`p-3 rounded-xl bg-white/5 ${color}`}><Icon className="w-5 h-5" /></div>
    </div>
);

export default Dashboard;