// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import { Github, Twitter, Disc, Activity } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="border-t border-white/5 bg-black/80 backdrop-blur-sm relative overflow-hidden mt-auto">
            <div className="container mx-auto px-6 py-20">

                {/* 🏗️ Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20">

                    {/* Brand Section */}
                    <div className="md:col-span-5 flex flex-col justify-between h-full space-y-6">
                        <div>
                            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                                <Disc className="w-5 h-5 text-indigo-400 animate-spin-slow" />
                            </div>
                            <h3 className="text-2xl font-medium text-white mb-4">
                                VoiceAI <span className="text-slate-500">Engine</span>
                            </h3>
                            <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                                The new standard for neural audio synthesis.
                                Precise control, ultra-low latency, and unmatched realism.
                            </p>
                        </div>

                        {/* ✅ SHINY IDEA: Added System Status Here */}
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <Link to="/support" className="text-xs font-mono text-emerald-500 hover:text-emerald-400 transition-colors">
                                All Systems Operational
                            </Link>
                        </div>
                    </div>

                    {/* Navigation Grid */}
                    <div className="md:col-span-2">
                        <h4 className="text-white text-sm font-semibold mb-6">Product</h4>
                        <ul className="space-y-4 text-xs text-slate-500">
                            {/* Linked to real pages */}
                            <li><Link to="/studio" className="hover:text-indigo-400 transition">Studio</Link></li>
                            <li><Link to="/projects" className="hover:text-indigo-400 transition">Showcase</Link></li>
                            <li><Link to="/developers" className="hover:text-indigo-400 transition">API</Link></li>
                            <li><Link to="/billing" className="hover:text-indigo-400 transition">Pricing</Link></li>
                        </ul>
                    </div>
                    <div className="md:col-span-2">
                        <h4 className="text-white text-sm font-semibold mb-6">Company</h4>
                        <ul className="space-y-4 text-xs text-slate-500">
                            <li><Link to="/" className="hover:text-indigo-400 transition">Mission</Link></li>
                            <li><Link to="/contact" className="hover:text-indigo-400 transition">Contact Sales</Link></li>
                            <li><Link to="/support" className="hover:text-indigo-400 transition">Support</Link></li>
                            <li><a href="#" className="hover:text-indigo-400 transition">Careers</a></li>
                        </ul>
                    </div>
                    <div className="md:col-span-3">
                        <h4 className="text-white text-sm font-semibold mb-6">Stay Updated</h4>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter email"
                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs text-white w-full focus:outline-none focus:border-indigo-500 transition"
                            />
                            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition">
                                Sub
                            </button>
                        </div>
                    </div>
                </div>

                {/* Massive Bottom Branding */}
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-slate-600">
                        &copy; 2025 VoiceAI Inc. •  Designed for the future.
                    </p>
                    <div className="flex gap-6">
                        <SocialLink icon={<Github className="w-4 h-4" />} />
                        <SocialLink icon={<Twitter className="w-4 h-4" />} />
                    </div>
                </div>
            </div>

            {/* Ambient Bottom Glow */}
            <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-indigo-600/10 blur-[150px] pointer-events-none" />
        </footer>
    );
};

const SocialLink = ({ icon }) => (
    <a href="#" className="text-slate-500 hover:text-white transition-colors">{icon}</a>
);

export default Footer;