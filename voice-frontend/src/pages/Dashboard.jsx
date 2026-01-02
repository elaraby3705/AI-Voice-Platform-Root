import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
    Activity, Cpu, Globe, ArrowUpRight, ArrowDownRight,
    Terminal, Clock, Plus, Copy, BookOpen, ShieldCheck, Zap
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
    const { user } = useAuth();
    // Fallback for user name to prevent crash
    const displayUser = user?.username || user?.email?.split('@')[0] || 'Operator';

    // Mock Data: Throughput
    const trafficData = [
        { time: '10:00', requests: 120, lat: 45 },
        { time: '10:05', requests: 180, lat: 48 },
        { time: '10:10', requests: 150, lat: 42 },
        { time: '10:15', requests: 290, lat: 55 },
        { time: '10:20', requests: 350, lat: 52 },
        { time: '10:25', requests: 280, lat: 45 },
        { time: '10:30', requests: 420, lat: 40 },
    ];

    return (
        <div className="flex min-h-screen bg-[#050505] selection:bg-indigo-500/30">
            <Sidebar />
            <main className="ml-64 flex-1 p-10 overflow-y-auto">

                {/* --- Header & Status Beacon --- */}
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
                        <span className="text-xs font-medium text-slate-300">All Systems Operational</span>
                        <div className="h-3 w-px bg-white/10 mx-1"></div>
                        <span className="text-xs font-mono text-slate-500">us-east-1</span>
                    </div>
                </div>

                {/* --- Quick Actions --- */}
                <div className="grid grid-cols-4 gap-4 mb-8 animate-fade-in-up delay-100">
                    <QuickAction title="New Synthesis" icon={Plus} shortcut="N" color="indigo" />
                    <QuickAction title="Clone Voice" icon={Copy} shortcut="C" color="purple" />
                    <QuickAction title="API Docs" icon={BookOpen} shortcut="D" color="emerald" />
                    <QuickAction title="Access Tokens" icon={ShieldCheck} shortcut="T" color="slate" />
                </div>

                {/* --- Main Analytics Grid --- */}
                <div className="grid grid-cols-3 gap-6 mb-8 animate-fade-in-up delay-200">

                    {/* Traffic Chart (2 Cols) */}
                    <div className="col-span-2 bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Activity className="w-4 h-4 text-indigo-500" /> Real-time Throughput
                            </h3>
                            <div className="flex gap-2">
                                <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20">LIVE</span>
                            </div>
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
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorReq)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Glow Effect */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-1000"></div>
                    </div>

                    {/* KPI Cards (Stacked) */}
                    <div className="col-span-1 space-y-4">
                        <KpiCard title="API Latency" value="42ms" change="-12%" trend="down" icon={Clock} color="text-emerald-400" />
                        <KpiCard title="Success Rate" value="99.98%" change="+0.2%" trend="up" icon={Zap} color="text-indigo-400" />
                        <KpiCard title="Active Workers" value="16/24" change="Idle" trend="neutral" icon={Cpu} color="text-yellow-400" />
                    </div>
                </div>

                {/* --- Bottom Row: Logs & Activity Heatmap --- */}
                <div className="grid grid-cols-3 gap-6 animate-fade-in-up delay-300">

                    {/* Activity Heatmap */}
                    <div className="col-span-1 bg-[#0A0A0A] border border-white/10 rounded-3xl p-6">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-slate-500" /> Generation Activity
                        </h3>
                        <div className="grid grid-cols-7 gap-1">
                            {[...Array(84)].map((_, i) => {
                                const opacity = Math.random() > 0.7 ? Math.random() : 0.1;
                                return (
                                    <div
                                        key={i}
                                        className="w-full pt-[100%] rounded-sm bg-indigo-500 transition-all hover:scale-125 hover:z-10 relative"
                                        style={{ opacity: Math.max(0.1, opacity) }}
                                    ></div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Live Terminal */}
                    <div className="col-span-2 bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 flex flex-col font-mono text-xs overflow-hidden">
                        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                            <h3 className="font-bold text-slate-400 flex items-center gap-2">
                                <Terminal className="w-3 h-3" /> ./system_logs.log
                            </h3>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                            </div>
                        </div>
                        <div className="flex-1 space-y-2 overflow-y-auto pr-2">
                            <LogLine time="10:42:01" type="INFO" msg="User session verified" />
                            <LogLine time="10:42:05" type="POST" msg="/api/v1/synthesis/stream [200 OK]" color="text-emerald-400" />
                            <LogLine time="10:42:12" type="WARN" msg="Memory usage peak detected (pod-12)" color="text-yellow-400" />
                            <LogLine time="10:43:00" type="INFO" msg="Auto-scaling trigger: +2 instances" />
                            <LogLine time="10:43:45" type="DB" msg="Backup snapshot created (4.2MB)" color="text-indigo-400" />
                        </div>
                    </div>
                </div>

            </main>
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

const LogLine = ({ time, type, msg, color = "text-slate-400" }) => (
    <div className="flex gap-3 hover:bg-white/5 p-1 rounded transition-colors cursor-default">
        <span className="text-slate-600 opacity-50">{time}</span>
        <span className={`font-bold ${color} w-10 text-right`}>{type}</span>
        <span className="text-slate-300 truncate">{msg}</span>
    </div>
);

export default Dashboard;