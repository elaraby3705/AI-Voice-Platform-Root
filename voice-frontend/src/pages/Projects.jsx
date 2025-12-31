import { useState } from 'react';
import {
    Play,
    Pause,
    Download,
    MoreVertical,
    FileAudio,
    Calendar,
    Clock,
    Search,
    Filter
} from 'lucide-react';

const Projects = () => {
    // Mock Data - In a real app, this comes from Firebase/API
    const [projects] = useState([
        { id: 1, name: "Marketing Campaign V2", voice: "Sarah (Pro)", text: "Welcome to the future of AI...", duration: "0:45", date: "Oct 24, 2025", status: "ready" },
        { id: 2, name: "Audiobook Chapter 3", voice: "Adam (Legacy)", text: "The door creaked open...", duration: "12:30", date: "Oct 23, 2025", status: "processing" },
        { id: 3, name: "Internal Memo", voice: "Marcus", text: "Q4 results are looking promising...", duration: "2:15", date: "Oct 22, 2025", status: "ready" },
        { id: 4, name: "Podcast Intro", voice: "Sarah (Pro)", text: "You are listening to Tech Daily...", duration: "0:15", date: "Oct 20, 2025", status: "failed" },
    ]);

    const [playing, setPlaying] = useState(null);

    const togglePlay = (id) => {
        if (playing === id) {
            setPlaying(null);
        } else {
            setPlaying(id);
        }
    };

    return (
        <div className="min-h-screen pt-24 px-4 md:px-8 pb-10 bg-black text-white">

            {/* Header & Controls */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Projects</h1>
                    <p className="text-slate-400 text-sm font-mono">
                        MANAGE SYNTHESIS ARCHIVES // TOTAL FILES: {projects.length}
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search archives..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                        />
                    </div>
                    <button className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                        <Filter className="w-4 h-4 text-slate-400" />
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
                        <FileAudio className="w-4 h-4" /> New Project
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="max-w-7xl mx-auto bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs font-mono text-slate-500 border-b border-white/5 bg-white/5">
                            <th className="p-4 font-normal uppercase tracking-wider">File Name</th>
                            <th className="p-4 font-normal uppercase tracking-wider">Voice Model</th>
                            <th className="p-4 font-normal uppercase tracking-wider">Duration</th>
                            <th className="p-4 font-normal uppercase tracking-wider">Date Created</th>
                            <th className="p-4 font-normal uppercase tracking-wider text-center">Status</th>
                            <th className="p-4 font-normal uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-white/5">
                        {projects.map((project) => (
                            <tr key={project.id} className="group hover:bg-white/5 transition-colors">

                                {/* Name & Preview */}
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => togglePlay(project.id)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                                playing === project.id
                                                ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                                                : 'bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white'
                                            }`}
                                        >
                                            {playing === project.id ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current pl-0.5" />}
                                        </button>
                                        <div>
                                            <div className="font-medium text-white">{project.name}</div>
                                            <div className="text-xs text-slate-500 truncate max-w-[150px]">{project.text}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Voice Model */}
                                <td className="p-4 text-slate-300">
                                    <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs">
                                        {project.voice}
                                    </span>
                                </td>

                                {/* Duration */}
                                <td className="p-4 text-slate-400 font-mono text-xs">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> {project.duration}
                                    </div>
                                </td>

                                {/* Date */}
                                <td className="p-4 text-slate-400 font-mono text-xs">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> {project.date}
                                    </div>
                                </td>

                                {/* Status Badge */}
                                <td className="p-4 text-center">
                                    {project.status === 'ready' && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wide border border-emerald-500/20">
                                            Ready
                                        </span>
                                    )}
                                    {project.status === 'processing' && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-bold uppercase tracking-wide border border-yellow-500/20 animate-pulse">
                                            Processing
                                        </span>
                                    )}
                                    {project.status === 'failed' && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-wide border border-red-500/20">
                                            Failed
                                        </span>
                                    )}
                                </td>

                                {/* Actions */}
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Download">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Projects;