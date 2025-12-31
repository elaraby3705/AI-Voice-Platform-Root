import { useState } from 'react';
import { LifeBuoy, Search, FileText, Activity, Plus, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

const Support = () => {
    // Mock Tickets
    const tickets = [
        { id: "TKT-9921", subject: "API Rate Limiting Issue", status: "open", date: "2 hours ago" },
        { id: "TKT-9904", subject: "Voice Cloning Accuracy", status: "closed", date: "1 day ago" },
    ];

    return (
        <div className="min-h-screen pt-24 px-4 md:px-8 pb-10 bg-black text-white">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Support Console</h1>
                        <p className="text-slate-400 text-sm font-mono">
                            TROUBLESHOOTING & DOCUMENTATION
                        </p>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Open New Ticket
                    </button>
                </div>

                {/* Search / Hero */}
                <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-8 text-center">
                    <LifeBuoy className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-6">How can we assist you, Commander?</h2>

                    <div className="max-w-2xl mx-auto relative group">
                        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search documentation, error codes, or FAQs..."
                            className="w-full bg-black/50 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                        />
                    </div>
                </div>

                {/* Quick Access Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Documentation */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                            API Documentation <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-slate-400">
                            Comprehensive guides for integrating our SDKs and REST API.
                        </p>
                    </div>

                    {/* System Status */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                            System Status <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-slate-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> All Systems Operational
                        </p>
                    </div>

                    {/* Community */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                            <LifeBuoy className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                            Community Forum <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-slate-400">
                            Connect with other developers and share voice models.
                        </p>
                    </div>
                </div>

                {/* Recent Tickets Table */}
                <div className="border border-white/10 rounded-2xl overflow-hidden">
                    <div className="bg-white/5 px-6 py-4 border-b border-white/10">
                        <h3 className="font-bold text-white">Your Recent Tickets</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {tickets.map((ticket) => (
                            <div key={ticket.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1">
                                        {ticket.status === 'open' ? (
                                            <Clock className="w-5 h-5 text-yellow-500" />
                                        ) : (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{ticket.subject}</h4>
                                        <p className="text-xs text-slate-500 font-mono mt-1">ID: {ticket.id} • {ticket.date}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${
                                    ticket.status === 'open'
                                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                }`}>
                                    {ticket.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Support;