import { Github, Twitter, Disc } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="border-t border-white/5 bg-black/80 backdrop-blur-sm relative overflow-hidden">
            <div className="container mx-auto px-6 py-20">

                {/* 🏗️ Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20">

                    {/* Brand Section */}
                    <div className="md:col-span-5 flex flex-col justify-between h-full">
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
                    </div>

                    {/* Navigation Grid */}
                    <div className="md:col-span-2">
                        <h4 className="text-white text-sm font-semibold mb-6">Product</h4>
                        <ul className="space-y-4 text-xs text-slate-500">
                            <li><a href="#" className="hover:text-indigo-400 transition">Changelog</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition">Documentation</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition">Integration</a></li>
                        </ul>
                    </div>
                    <div className="md:col-span-2">
                        <h4 className="text-white text-sm font-semibold mb-6">Company</h4>
                        <ul className="space-y-4 text-xs text-slate-500">
                            <li><a href="#" className="hover:text-indigo-400 transition">Manifesto</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition">Careers</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition">Press Kit</a></li>
                        </ul>
                    </div>
                    <div className="md:col-span-3">
                        <h4 className="text-white text-sm font-semibold mb-6">Stay Updated</h4>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Enter email" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs text-white w-full focus:outline-none focus:border-indigo-500 transition" />
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