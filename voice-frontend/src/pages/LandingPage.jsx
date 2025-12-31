import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Mic, Play, Pause, ArrowRight, Code, Terminal, Check, Zap, Globe,
    Layers, ChevronRight, Sparkles, Server, Shield, Headphones, BookOpen, Gamepad2
} from 'lucide-react';

const LandingPage = () => {
    const [activeSection, setActiveSection] = useState('hero');
    const sections = useRef({});

    // 🕵️‍♂️ Advanced Scroll Spy Logic
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.3 } // Trigger when 30% of section is visible
        );

        Object.values(sections.current).forEach((section) => {
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="relative">
            {/* 📍 Sticky Sidebar (Fixed Navigation) */}
            <div className="hidden xl:block fixed left-12 top-1/3 z-40 w-48 animate-fade-in">
                <nav className="flex flex-col gap-5 border-l border-white/10 pl-5">
                    <SidebarLink id="hero" active={activeSection} label="Start" />
                    <SidebarLink id="specs" active={activeSection} label="Tech Specs" />
                    <SidebarLink id="use-cases" active={activeSection} label="Use Cases" />
                    <SidebarLink id="gallery" active={activeSection} label="Voice Gallery" />
                    <SidebarLink id="pricing" active={activeSection} label="Plans" />
                </nav>
            </div>

            <div className="flex flex-col gap-32 pb-20">
                <HeroJumbotron ref={(el) => (sections.current.hero = el)} />
                <TechSpecs ref={(el) => (sections.current.specs = el)} />
                <UseCases ref={(el) => (sections.current['use-cases'] = el)} />
                <VoiceGalleryCarousel ref={(el) => (sections.current.gallery = el)} />
                <PricingAlbum ref={(el) => (sections.current.pricing = el)} />
                <FinalCallToAction />
            </div>
        </div>
    );
};

// --- Sub Components ---

const SidebarLink = ({ id, active, label }) => (
    <a
        href={`#${id}`}
        onClick={(e) => {
            e.preventDefault();
            document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
        }}
        className={`text-[10px] font-mono uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 ${
            active === id ? 'text-indigo-400 font-bold translate-x-2' : 'text-slate-600 hover:text-slate-400'
        }`}
    >
        {active === id && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
        {label}
    </a>
);

// 1. Hero Section
const HeroJumbotron = ({ ref }) => ( // Pass ref correctly (React 18 way or forwardRef)
    <section id="hero" ref={ref} className="relative pt-20 flex flex-col items-center text-center px-4 min-h-[90vh] justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-up">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span>v2.4: Emotional Intelligence Live</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter mb-8 leading-[0.95]">
                Speak to the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-white">
                    Next Generation.
                </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                The enterprise audio infrastructure. <span className="text-white font-medium">Sub-50ms latency</span> for AI agents,
                <span className="text-white font-medium"> emotion control</span> for content, and
                <span className="text-white font-medium"> 99.99% uptime</span> for scale.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Link to="/register" className="px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-105">
                    Start Building <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/studio" className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-md">
                    <Play className="w-5 h-5 fill-current" /> Live Demo
                </Link>
            </div>
        </div>
    </section>
);

// 2. Tech Specs (New Data-Heavy Section)
const TechSpecs = ({ ref }) => (
    <section id="specs" ref={ref} className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <SpecCard icon={<Zap className="text-yellow-400"/>} label="Latency" value="< 50ms" desc="Global Edge Network" />
            <SpecCard icon={<Server className="text-emerald-400"/>} label="Uptime" value="99.99%" desc="SLA Guaranteed" />
            <SpecCard icon={<Globe className="text-blue-400"/>} label="Languages" value="29+" desc="Auto-Detection" />
            <SpecCard icon={<Shield className="text-purple-400"/>} label="Security" value="SOC2" desc="Type II Certified" />
        </div>
    </section>
);

const SpecCard = ({ icon, label, value, desc }) => (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center group hover:bg-white/10 transition-colors">
        <div className="flex justify-center mb-4"><div className="p-3 bg-white/5 rounded-xl">{icon}</div></div>
        <div className="text-3xl font-bold text-white mb-1 group-hover:scale-110 transition-transform">{value}</div>
        <div className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-2">{label}</div>
        <div className="text-xs text-slate-500">{desc}</div>
    </div>
);

// 3. Use Cases (New Section)
const UseCases = ({ ref }) => (
    <section id="use-cases" ref={ref} className="py-20 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Built for every frequency</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <UseCaseCard
                    icon={<Headphones className="w-8 h-8 text-pink-400" />}
                    title="Audiobooks & Podcasts"
                    desc="Generate long-form content with consistent character voices and emotional depth. Export to MP3/WAV instantly."
                />
                <UseCaseCard
                    icon={<Gamepad2 className="w-8 h-8 text-purple-400" />}
                    title="Gaming & NPCs"
                    desc="Give your NPCs a voice. Dynamic, run-time generation allows characters to respond to player actions in real-time."
                />
                <UseCaseCard
                    icon={<Terminal className="w-8 h-8 text-emerald-400" />}
                    title="Customer Support Agents"
                    desc="Replace robotic IVR with warm, human-like assistants that understand nuance and never get tired."
                />
            </div>
        </div>
    </section>
);

const UseCaseCard = ({ icon, title, desc }) => (
    <div className="p-8 rounded-3xl bg-black border border-white/10 hover:border-indigo-500/50 transition-colors group">
        <div className="mb-6 bg-white/5 w-fit p-4 rounded-2xl group-hover:bg-white/10 transition-colors">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
    </div>
);

// 4. Voice Gallery
const VoiceGalleryCarousel = ({ ref }) => {
    const [activeVoice, setActiveVoice] = useState(0);
    const voices = [
        { id: 1, name: "Sarah", tag: "Narrator", color: "from-pink-500 to-rose-500", desc: "Warm, professional, and authoritative." },
        { id: 2, name: "Marcus", tag: "News", color: "from-blue-500 to-indigo-500", desc: "Deep, fast-paced, and clear." },
        { id: 3, name: "Nova", tag: "Assistant", color: "from-emerald-500 to-teal-500", desc: "Neutral, helpful, and precise." },
    ];

    return (
        <section id="gallery" ref={ref} className="py-20 max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">Meet the Cast</h2>
                <p className="text-slate-400">Select a neural model to audition.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {voices.map((voice, idx) => (
                    <div
                        key={voice.id}
                        onClick={() => setActiveVoice(idx)}
                        className={`relative p-6 rounded-3xl border cursor-pointer transition-all duration-300 ${activeVoice === idx ? 'bg-white/10 border-indigo-500/50 ring-1 ring-indigo-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${voice.color} mb-4 flex items-center justify-center text-white font-bold`}>
                            <Mic className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{voice.name}</h3>
                        <p className="text-xs text-indigo-300 mb-3 font-mono uppercase">{voice.tag}</p>
                        <p className="text-slate-400 text-xs mb-4">{voice.desc}</p>
                        <div className={`w-full h-1 rounded-full ${activeVoice === idx ? 'bg-indigo-500' : 'bg-white/10'}`} />
                    </div>
                ))}
            </div>
        </section>
    );
};

// 5. Pricing (With Toggle)
const PricingAlbum = ({ ref }) => {
    const [annual, setAnnual] = useState(true);

    return (
        <section id="pricing" ref={ref} className="py-24 max-w-7xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-white text-center mb-8">Simple Pricing</h2>

            {/* Toggle Switch */}
            <div className="flex justify-center mb-12">
                <div className="bg-white/10 p-1 rounded-full flex relative">
                    <button onClick={() => setAnnual(false)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!annual ? 'bg-white text-black' : 'text-slate-400'}`}>Monthly</button>
                    <button onClick={() => setAnnual(true)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${annual ? 'bg-white text-black' : 'text-slate-400'}`}>Yearly</button>
                    {annual && <div className="absolute -right-20 top-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">SAVE 20%</div>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <PricingCard title="Starter" price="$0" features={["10 mins/mo", "Standard Voices", "Personal Use"]} cta="Get Started" />
                <PricingCard title="Pro Creator" price={annual ? "$24" : "$29"} featured={true} features={["20 hours/mo", "Voice Cloning", "Commercial Rights", "Priority Support"]} cta="Upgrade Now" />
                <PricingCard title="Enterprise" price="Custom" features={["Unlimited Scale", "Private Models", "SSO & SLA", "Dedicated Account Manager"]} cta="Contact Sales" />
            </div>
        </section>
    );
};

const PricingCard = ({ title, price, features, cta, featured }) => (
    <div className={`p-8 rounded-3xl border transition-all ${featured ? 'bg-black border-indigo-500 relative shadow-2xl shadow-indigo-900/40 scale-105' : 'bg-white/5 border-white/10'}`}>
        {featured && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">Most Popular</div>}
        <h3 className={`text-xl font-bold ${featured ? 'text-indigo-400' : 'text-white'}`}>{title}</h3>
        <div className="text-4xl font-bold text-white my-4">{price}<span className="text-sm text-slate-500 font-normal">/mo</span></div>
        <ul className="space-y-4 mb-8 text-sm text-slate-300">
            {features.map((f, i) => <li key={i} className="flex gap-2"><Check className="w-4 h-4 text-emerald-400" /> {f}</li>)}
        </ul>
        <button className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${featured ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'border border-white/20 text-white hover:bg-white hover:text-black'}`}>{cta}</button>
    </div>
);

// 6. Final CTA
const FinalCallToAction = () => (
    <section className="px-4 mb-20 text-center">
        <h2 className="text-white text-2xl font-bold mb-6">Ready to find your voice?</h2>
        <Link to="/register" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold text-lg hover:underline underline-offset-4 transition-all">
            Create free account <ArrowRight className="w-5 h-5" />
        </Link>
    </section>
);

export default LandingPage;