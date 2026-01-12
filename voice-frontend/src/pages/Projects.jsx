import { useState, useEffect } from 'react';
import api from '../api/axios'; // The Axios instance we fixed
import {
    Plus, Search, Layers, Calendar,
    MoreVertical, FolderOpen, Activity, X, Loader2,
    FileAudio, Filter, Clock, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Projects() {
    // --- State Management ---
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [creating, setCreating] = useState(false);

    // --- 1. Fetch Data on Load ---
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects/');
            setProjects(response.data);
        } catch (err) {
            console.error("Failed to load projects:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- 2. Create Project Logic ---
    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const response = await api.post('/projects/', formData);
            // Optimistic Update: Add to list immediately
            setProjects([response.data, ...projects]);
            setIsModalOpen(false);
            setFormData({ name: '', description: '' });
        } catch (err) {
            console.error("Creation failed:", err);
        } finally {
            setCreating(false);
        }
    };

    // --- 3. Filter Logic ---
    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- Render: Loading State ---
    if (loading) return (
        <div className="min-h-screen bg-[#050505] ml-64 flex items-center justify-center text-indigo-500 font-mono animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin mr-3" /> Syncing Archives...
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 ml-64 selection:bg-indigo-500/30">

            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        <Layers className="w-8 h-8 text-indigo-500" />
                        Mission Archives
                    </h1>
                    <p className="text-slate-400 text-sm font-mono uppercase tracking-wider">
                        Active Operations: <span className="text-white font-bold">{projects.length}</span> // System Ready
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative group">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search missions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[#0A0A0A] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 w-64 transition-all shadow-inner"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> New Project
                    </button>
                </div>
            </div>

            {/* --- Content Area --- */}
            {projects.length === 0 ? (
                <EmptyState onCreate={() => setIsModalOpen(true)} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}

            {/* --- Create Modal (Glassmorphism) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative ring-1 ring-white/10">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <FileAudio className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Initialize Operation</h2>
                                <p className="text-xs text-slate-500 font-mono">NEW_PROJECT_WIZARD_V1.0</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Project Codename</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. Alpha Protocol"
                                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Mission Brief (Description)</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Describe the objectives..."
                                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                                >
                                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Sub Components ---

const ProjectCard = ({ project }) => (
    <div className="group bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] relative flex flex-col h-full">
        {/* Card Header */}
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/5 rounded-xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                <FolderOpen className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500">{new Date(project.created_at).toLocaleDateString()}</span>
                <button className="text-slate-600 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Card Body */}
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors truncate">
            {project.name}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">
            {project.description || "No mission brief provided for this operation."}
        </p>

        {/* Card Footer */}
        <div className="mt-auto border-t border-white/5 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                <Activity className="w-3 h-3" /> Active
            </div>

            {/* Future Link: Go to Studio for this specific project */}
            <Link to={`/studio?project=${project.id}`} className="text-xs font-bold text-indigo-400 flex items-center gap-1 hover:gap-2 transition-all">
                Open Studio <ArrowRight className="w-3 h-3" />
            </Link>
        </div>
    </div>
);

const EmptyState = ({ onCreate }) => (
    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02] animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
            <Layers className="w-10 h-10 text-slate-600" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Active Operations</h3>
        <p className="text-slate-500 max-w-sm text-center mb-8">
            The archives are empty. Initialize a new voice synthesis campaign to begin using the Neural Core.
        </p>
        <button
            onClick={onCreate}
            className="flex items-center gap-2 bg-white text-black hover:bg-slate-200 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-xl hover:scale-105"
        >
            <Plus className="w-4 h-4" /> Initialize First Project
        </button>
    </div>
);