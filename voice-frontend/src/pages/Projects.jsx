import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
    Plus, Search, Layers, FileAudio, Loader2, ArrowRight, 
    Settings, BarChart3, LogOut, FolderOpen, Clock, Trash2, Mic2, AlertCircle
} from 'lucide-react';

export default function Projects() {
    // --- State Management ---
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); 
    const [activeTab, setActiveTab] = useState('all'); 

    const [formData, setFormData] = useState({ name: '', description: '' });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);

    // --- Data Fetching ---
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
        } finally {
            setLoading(false);
        }
    };

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

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-indigo-500 font-mono animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin mr-3" /> Syncing Mission Archives...
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
            {/* --- Left Sidebar --- */}
            <aside className="fixed top-0 left-0 h-screen bg-[#0A0A0A] border-r border-white/10 w-64 flex flex-col p-4 z-50">
                <div className="flex items-center gap-3 px-2 mb-12 mt-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)]">AI</div>
                    <span className="font-bold tracking-tighter text-lg">NEURAL CORE</span>
                </div>
                
                <nav className="flex-1 space-y-2">
                    <SidebarItem icon={Layers} label="Mission Archives" active />
                    <SidebarItem icon={BarChart3} label="Synthesis Analytics" />
                    <SidebarItem icon={Settings} label="System Config" />
                </nav>

                {/* User Context Hub */}
                <div className="mt-auto border-t border-white/10 pt-6 space-y-4">
                    <div className="px-2">
                        <div className="text-[10px] text-slate-600 uppercase font-bold mb-3">Active Workspace</div>
                        <button className="flex items-center gap-3 w-full p-2.5 bg-white/5 rounded-xl border border-white/5 hover:border-indigo-500/50 transition-all group">
                            <div className="w-5 h-5 rounded bg-indigo-500" />
                            <span className="text-xs font-bold text-white">Neural Synthesis Lab</span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between px-2 pt-2">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs">HI</div>
                            <div>
                                <div className="text-xs font-bold">Hammad Ibrahim</div>
                                <div className="text-[10px] text-slate-500">h.ibrahim3705@gmail.com</div>
                            </div>
                        </div>
                        <button className="text-slate-600 hover:text-rose-400 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* --- Main Dashboard --- */}
            <main className="flex-1 ml-64 p-8">
                <header className="flex justify-between items-end mb-12 animate-in fade-in duration-700">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter mb-2">Neural Synthesis</h1>
                        <p className="text-slate-500 text-sm">Managing operational data nodes across the cluster.</p>
                    </div>
                </header>

                <section className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 mb-8 flex items-center gap-4">
                    <div className="flex flex-1 items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/5 focus-within:border-indigo-500/50 transition-all">
                        <Search className="w-4 h-4 text-slate-500" />
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none w-full focus:ring-0 text-sm placeholder:text-slate-600 outline-none"
                            placeholder="Search by codename..."
                        />
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-white text-black font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-slate-200 transition-all hover:scale-[1.02]">
                        <Plus className="w-4 h-4" /> New Node
                    </button>
                </section>

                {filteredProjects.length === 0 ? (
                    <EmptyState onCreate={() => setIsModalOpen(true)} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <ProjectGridCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

// --- Supporting Components ---
const SidebarItem = ({ icon: Icon, label, active }) => (
    <button className={`flex items-center gap-3 p-3 w-full rounded-xl transition-all ${active ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
        <Icon className="w-5 h-5" />
        <span className="text-sm font-bold">{label}</span>
    </button>
);

const ProjectGridCard = ({ project }) => (
    <div className="group bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300 relative flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <FolderOpen className="w-6 h-6" />
            </div>
        </div>
        <h3 className="text-lg font-bold text-white mb-2 truncate">{project.name}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">{project.description || "No description provided."}</p>
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

const EmptyState = ({ onCreate }) => (
    <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
        <Mic2 className="w-12 h-12 text-indigo-500 mb-6 opacity-50" />
        <h3 className="text-xl font-bold text-white mb-2">Archive Empty</h3>
        <p className="text-slate-500 max-w-sm text-center mb-8 text-sm">Initialize your first neural workspace to begin synthesis.</p>
        <button onClick={onCreate} className="flex items-center gap-2 bg-white text-black hover:bg-slate-200 px-8 py-3 rounded-xl text-sm font-bold transition-all">
            <Plus className="w-4 h-4" /> Create Workspace
        </button>
    </div>
);
