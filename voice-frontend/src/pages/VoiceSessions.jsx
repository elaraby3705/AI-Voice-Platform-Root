import { Activity, Wifi, Cpu, DollarSign, Terminal } from 'lucide-react';

const VoiceSessions = () => {
    // Mock Data
    const sessions = [
        { id: "SESS-8392", agent: "Customer Support Bot", start: "10:42:01 AM", duration: "4m 12s", latency: "45ms", cost: "$0.12", status: "completed" },
        { id: "SESS-8393", agent: "Sales Assistant", start: "11:15:30 AM", duration: "12m 05s", latency: "52ms", cost: "$0.45", status: "completed" },
        { id: "SESS-8394", agent: "Technical Support", start: "11:45:00 AM", duration: "--:--", latency: "38ms", cost: "Est $0.05", status: "live" },
    ];

    return (
        <div className="min-h-screen pt-24 px-4 md:px-8 pb-10 bg-black text-white">

            {/* Header */}
            <div className="max-w-7xl mx-auto mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Session Logs</h1>
                <p className="text-slate-400 text-sm font-mono">
                    REAL-TIME NEURAL LINK MONITORING
                </p>
            </div>

            {/* Top Metrics Cards */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-slate-500 text-[10px] font-mono uppercase">Avg Latency</span>
                        <Wifi className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono">42ms</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-slate-500 text-[10px] font-mono uppercase">System Load</span>
                        <Activity className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono">12%</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-slate-500 text-[10px] font-mono uppercase">Active Nodes</span>
                        <Cpu className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono">8/10</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-slate-500 text-[10px] font-mono uppercase">Total Cost</span>
                        <DollarSign className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono">$1,240.50</div>
                </div>
            </div>

            {/* Session Terminal / List */}
            <div className="max-w-7xl mx-auto bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

                {/* Terminal Header */}
                <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-mono text-slate-400">/var/logs/sessions.log</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                </div>

                {/* Log List */}
                <div className="divide-y divide-white/5 font-mono text-sm">
                    {sessions.map((session) => (
                        <div key={session.id} className="p-4 hover:bg-white/5 transition-colors grid grid-cols-1 md:grid-cols-12 gap-4 items-center group">

                            {/* Status Indicator */}
                            <div className="md:col-span-1 flex items-center justify-center">
                                {session.status === 'live' ? (
                                    <div className="relative flex items-center justify-center">
                                        <div className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
                                        <div className="relative w-2 h-2 bg-red-500 rounded-full" />
                                    </div>
                                ) : (
                                    <div className="w-2 h-2 bg-emerald-500/50 rounded-full" />
                                )}
                            </div>

                            {/* ID */}
                            <div className="md:col-span-2 text-indigo-400">
                                {session.id}
                            </div>

                            {/* Agent Name */}
                            <div className="md:col-span-3 text-white font-semibold">
                                {session.agent}
                            </div>

                            {/* Timestamp */}
                            <div className="md:col-span-2 text-slate-500 text-xs">
                                {session.start}
                            </div>

                            {/* Metrics */}
                            <div className="md:col-span-3 flex gap-4 text-xs">
                                <span className="text-slate-400">Dur: <span className="text-white">{session.duration}</span></span>
                                <span className="text-slate-400">Lat: <span className="text-emerald-400">{session.latency}</span></span>
                            </div>

                            {/* Cost */}
                            <div className="md:col-span-1 text-right text-slate-300">
                                {session.cost}
                            </div>
                        </div>
                    ))}

                    {/* Simulated Empty Lines for Terminal Feel */}
                    <div className="p-4 text-slate-700 text-xs">
                        {`>`} Awaiting new incoming connections...<span className="animate-pulse">_</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceSessions;