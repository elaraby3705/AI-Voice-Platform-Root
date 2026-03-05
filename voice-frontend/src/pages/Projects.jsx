import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
    Plus, Search, Layers, Calendar,
    MoreVertical, FolderOpen, Activity, X, Loader2,
    FileAudio, ArrowRight, AlertCircle, LayoutGrid, List,
    Clock, Filter, Trash2, Mic2
} from 'lucide-react';

export default function Projects() {
    // --- State Management ---
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'archived'

    // Form State
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);

    // --- 1. Fetch Logic ---
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects/');
            let data = [];
            if (Array.isArray(response.data)) {
                data = response.data;
            } else if (response.data && Array.isArray(response.data.results)) {
                data = response.data.results;
            }
            setProjects(data);
        } catch (err) {
            console.error("Failed to load projects:", err);
            setError("Could not sync with the Archives.");
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    // --- 2. Create Logic ---
    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const response = await api.post('/projects/', formData);
            setProjects(prev => [response.data, ...(Array.isArray(prev) ? prev : [])]);
            setIsModalOpen(false);
            setFormData({ name: '', description: '' });
        } catch (err) {
            console.error("Creation failed:", err);
            setError("Failed to initialize operation.");
        } finally {
            setCreating(false);
        }
    };

    // --- 3. Filter & Search Logic ---
    const safeProjects = Array.isArray(projects) ? projects : [];

    const filteredProjects = safeProjects.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' ? true : activeTab === 'active' ? true : false; // Placeholder logic for tabs
        return matchesSearch && matchesTab;
    });

    // --- Helper Components ---
    const StatBadge = ({ label, value, icon: Icon }) => (
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-xl">
            <div className="p-2 bg-white/5 rounded-lg text-indigo-400">
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{label}</div>
                <div className="text-sm font-bold text-white font-mono">{value}</div>
            </div>
        </div>
    );

    if (loading) return (
        <div className="min-h-screen bg-[#050505] ml-64 flex items-center justify-center text-indigo-500 font-mono animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin mr-3" /> Syncing Mission Archives...
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 ml-64 selection:bg-indigo-500/30 font-sans">

            {/* --- Top Bar: Stats & Title --- */}
            <div className="flex justify-between items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        Mission Archives
                        <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                            V2.0
                        </span>
                    </h1>
                    <p className="text-slate-400 text-sm">Manage and organize your neural synthesis operations.</p>
                </div>
                <div className="flex gap-4">
                    <StatBadge label="Total Projects" value={projects.length} icon={Layers} />
                    <StatBadge label="Storage Used" value="1.2 GB" icon={FileAudio} />
                </div>
            </div>

            {/* --- Control Bar (Search, Tabs, View) --- */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-[#0A0A0A] border border-white/10 p-2 rounded-2xl sticky top-4 z-40 backdrop-blur-xl bg-opacity-80">

                {/* Left: Tabs & Search */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex bg-white/5 rounded-xl p-1 gap-1">
                        {['all', 'active', 'archived'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                                    activeTab === tab
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-white/10 hidden md:block" />

                    <div className="relative group flex-1">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by codename..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none text-sm text-white focus:ring-0 placeholder:text-slate-600 w-full md:w-64"
                        />
                    </div>
                </div>

                {/* Right: Actions & View Toggle */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <div className="flex bg-white/5 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 hover:scale-105"
                    >
                        <Plus className="w-4 h-4" /> <span className="hidden md:inline">New Project</span>
                    </button>
                </div>
            </div>

            {/* --- Error Banner --- */}
            {error && (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm animate-in fade-in">
                    <AlertCircle className="w-5 h-5" /> {error}
                </div>
            )}

            {/* --- Projects Display Area --- */}
            {filteredProjects.length === 0 ? (
                <EmptyState onCreate={() => setIsModalOpen(true)} isSearching={searchQuery.length > 0} />
            ) : (
                <div className={
                    viewMode === 'grid'
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500"
                    : "flex flex-col gap-3 animate-in fade-in duration-500"
                }>
                    {filteredProjects.map((project) => (
                        viewMode === 'grid'
                        ? <ProjectGridCard key={project.id} project={project} />
                        : <ProjectListRow key={project.id} project={project} />
                    ))}
                </div>
            )}

            {/* --- Create Modal --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-2xl p-8 shadow-2xl relative ring-1 ring-white/10 overflow-hidden">
                        {/* Decorative Gradient */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />

                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-1">Initialize Project</h2>
                        <p className="text-slate-500 text-sm mb-6">Create a new secure workspace for voice synthesis.</p>

                        <form onSubmit={handleCreate} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Codename</label>
                                <input
                                    type="text" required value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. Project Chimera"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
                                <textarea
                                    rows="3" value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Mission objectives..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                                />
                            </div>
                            <button
                                type="submit" disabled={creating}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Workspace'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Sub Components (Grid & List Views) ---

const ProjectGridCard = ({ project }) => (
    <div className="group bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(79,70,229,0.15)] relative flex flex-col h-full overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent blur-2xl rounded-full pointer-events-none group-hover:from-indigo-500/20 transition-all" />

        <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                <FolderOpen className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${project.status === 'failed' ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`} />
            </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 truncate pr-4">{project.name}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1 h-10 leading-relaxed">
            {project.description || "No description provided."}
        </p>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" /> {new Date(project.created_at).toLocaleDateString()}
            </span>
            <Link to={`/studio?project=${project.id}`} className="text-xs font-bold text-white bg-white/5 hover:bg-indigo-600 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2">
                Open <ArrowRight className="w-3 h-3" />
            </Link>
        </div>
    </div>
);

const ProjectListRow = ({ project }) => (
    <div className="group bg-[#0A0A0A] border border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-indigo-500/30 hover:bg-white/[0.02] transition-all">
        <div className="flex items-center gap-4 flex-1">
            <div className="p-3 bg-white/5 rounded-lg text-indigo-400 group-hover:text-indigo-300">
                <FolderOpen className="w-5 h-5" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-white mb-0.5">{project.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-1 max-w-md">{project.description || "No description"}</p>
            </div>
        </div>

        <div className="flex items-center gap-8 mr-4">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Created</span>
                <span className="text-xs text-slate-400 font-mono">{new Date(project.created_at).toLocaleDateString()}</span>
            </div>
            <div className="hidden md:block">
                <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 uppercase">Active</span>
            </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link to={`/studio?project=${project.id}`} className="p-2 hover:bg-indigo-600 hover:text-white text-indigo-400 rounded-lg transition-colors">
                <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="p-2 hover:bg-rose-500/20 hover:text-rose-400 text-slate-600 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    </div>
);

const EmptyState = ({ onCreate, isSearching }) => (
    <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Mic2 className="w-8 h-8 text-indigo-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
            {isSearching ? 'No Results Found' : 'Archive Empty'}
        </h3>
        <p className="text-slate-500 max-w-sm text-center mb-8 text-sm leading-relaxed">
            {isSearching
                ? "Adjust your search filters to find what you're looking for."
                : "Initialize your first neural voice project to begin the synthesis."}
        </p>
        <button
            onClick={onCreate}
            className="flex items-center gap-2 bg-white text-black hover:bg-slate-200 px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-xl hover:scale-105"
        >
            <Plus className="w-4 h-4" /> Create New Project
        </button>
    </div>
);
