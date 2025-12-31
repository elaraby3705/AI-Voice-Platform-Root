import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Mic, Play, ArrowRight, Zap, Globe, Server, Shield,
    Headphones, Gamepad2, Terminal, Check, Search, Command,
    Code, Quote, Plus, ChevronDown
} from 'lucide-react';

const LandingPage = () => {
    const [activeSection, setActiveSection] = useState('hero');
    // 🆕 State to control Sidebar visibility near footer
    const [isSidebarHidden, setIsSidebarHidden] = useState(false);

    const sections = useRef({});
    const footerSentinelRef = useRef(null); // 🆕 Ref for the bottom of the page

    // 1. 🕵️‍♂️ Scroll Spy (Active Section Highlighting)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.2, rootMargin: "-10% 0px -30% 0px" }
        );

        Object.values(sections.current).forEach((section) => {
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, []);

    // 2. 👻 Footer Collision Detection (Hide Sidebar when near bottom)
    useEffect(() => {
        const footerObserver = new IntersectionObserver(
            ([entry]) => {
                // If the bottom sentinel is visible, HIDE the sidebar
                setIsSidebarHidden(entry.isIntersecting);
            },
            {
                threshold: 0.1,
                rootMargin: "100px" // Start fading out slightly before hitting the very bottom
            }
        );

        if (footerSentinelRef.current) {
            footerObserver.observe(footerSentinelRef.current);
        }

        return () => footerObserver.disconnect();
    }, []);

    return (
        <div className="relative">
            {/* 📍 Sticky Sidebar (Now with Fade Logic) */}
            <div
                className={`hidden xl:block fixed left-8 top-1/4 z-40 w-48 transition-all duration-500 ease-in-out ${
                    isSidebarHidden
                        ? 'opacity-0 -translate-x-10 pointer-events-none' // Fades out & slides left
                        : 'opacity-100 translate-x-0' // Normal state
                }`}
            >
                <nav className="flex flex-col gap-4 border-l border-white/10 pl-5">
                    <SidebarLink id="hero" active={activeSection} label="Start" />
                    <SidebarLink id="pipeline" active={activeSection} label="How it Works" />
                    <SidebarLink id="specs" active={activeSection} label="Tech Specs" />
                    <SidebarLink id="use-cases" active={activeSection} label="Use Cases" />
                    <SidebarLink id="gallery" active={activeSection} label="Voice Gallery" />
                    <SidebarLink id="integrations" active={activeSection} label="Integrations" />
                    <SidebarLink id="testimonials" active={activeSection} label="Reviews" />
                    <SidebarLink id="pricing" active={activeSection} label="Pricing" />
                    <SidebarLink id="faq" active={activeSection} label="FAQ" />
                </nav>
            </div>

            <div className="flex flex-col gap-32 pb-0"> {/* Removed bottom padding to let sentinel hit footer */}
                <HeroJumbotron ref={(el) => (sections.current.hero = el)} />
                <LogoTicker />
                <HowItWorks ref={(el) => (sections.current.pipeline = el)} />
                <TechSpecs ref={(el) => (sections.current.specs = el)} />
                <UseCases ref={(el) => (sections.current['use-cases'] = el)} />
                <VoiceGalleryCarousel ref={(el) => (sections.current.gallery = el)} />
                <IntegrationsGrid ref={(el) => (sections.current.integrations = el)} />
                <Testimonials ref={(el) => (sections.current.testimonials = el)} />
                <NeuralSearch />
                <PricingAlbum ref={(el) => (sections.current.pricing = el)} />
                <FAQSection ref={(el) => (sections.current.faq = el)} />
                <FinalCallToAction />

                {/* 🆕 The Sentinel: An invisible line at the bottom to trigger the sidebar fade */}
                <div ref={footerSentinelRef} className="h-32 w-full pointer-events-none" />
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

// ... [Keep all your other sections (Hero, Specs, Gallery, etc.) EXACTLY the same] ...
// I am including the rest below just for completeness so you can copy-paste the whole file.

// 1. Hero
const HeroJumbotron = ({ ref }) => (
    <section id="hero" ref={ref} className="relative pt-20 flex flex-col items-center text-center px-4 min-h-[90vh] justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-up">
                <Code className="w-3 h-3 text-yellow-400" />
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

// 2. Logo Ticker
const LogoTicker = () => {
    return (
        <section className="border-y border-white/5 bg-white/[0.02] py-10 overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />
            <div className="relative flex overflow-x-hidden">
                <div className="animate-marquee whitespace-nowrap flex items-center gap-20 px-16 text-slate-500 font-bold text-xl opacity-50">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex gap-20">
                            <span>ACME CORP</span><span>NEXUS AI</span><span>CYBERDYNE</span>
                            <span>WAYLAND</span><span>TYRELL CORP</span><span>MASSIVE DYNAMIC</span>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`.animate-marquee { animation: marquee 30s linear infinite; } @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
        </section>
    );
};

// 3. How It Works
const HowItWorks = ({ ref }) => (
    <section id="pipeline" ref={ref} className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">From Text to Reality</h2>
            <p className="text-slate-400">The generation pipeline explained.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 z-0" />
            <StepCard number="01" title="Input" desc="Send text via API or type in Studio. Add emotional tags like [Happy] or [Whisper]." />
            <StepCard number="02" title="Synthesis" desc="Our Neural Engine analyzes context and phonemes in < 30ms." />
            <StepCard number="03" title="Stream" desc="Audio bytes are streamed instantly back to your client via WebSocket." />
        </div>
    </section>
);

const StepCard = ({ number, title, desc }) => (
    <div className="relative z-10 bg-black border border-white/10 p-8 rounded-3xl text-center group hover:border-indigo-500/50 transition-colors">
        <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6 group-hover:bg-indigo-600 transition-colors shadow-lg">
            {number}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

// 4. Tech Specs
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

// 5. Use Cases
const UseCases = ({ ref }) => (
    <section id="use-cases" ref={ref} className="py-20 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Built for every frequency</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <UseCaseCard icon={<Headphones className="w-8 h-8 text-pink-400" />} title="Audiobooks & Podcasts" desc="Generate long-form content with consistent character voices and emotional depth." />
                <UseCaseCard icon={<Gamepad2 className="w-8 h-8 text-purple-400" />} title="Gaming & NPCs" desc="Give your NPCs a voice. Dynamic, run-time generation allows characters to respond in real-time." />
                <UseCaseCard icon={<Terminal className="w-8 h-8 text-emerald-400" />} title="Customer Support" desc="Replace robotic IVR with warm, human-like assistants that never get tired." />
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

// 6. Voice Gallery
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
                    <div key={voice.id} onClick={() => setActiveVoice(idx)} className={`relative p-6 rounded-3xl border cursor-pointer transition-all duration-300 ${activeVoice === idx ? 'bg-white/10 border-indigo-500/50 ring-1 ring-indigo-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${voice.color} mb-4 flex items-center justify-center text-white font-bold`}><Mic className="w-6 h-6" /></div>
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

// 7. Integrations
const IntegrationsGrid = ({ ref }) => (
    <section id="integrations" ref={ref} className="py-20 px-4 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Plays well with others</h2>
            <p className="text-slate-400">SDKs available for your favorite stack.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Python', 'Node.js', 'React', 'Unity', 'Unreal', 'Go', 'Flutter', 'REST API'].map((tech) => (
                <div key={tech} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-center gap-3 text-slate-300 hover:text-white hover:bg-white/10 transition-colors font-mono text-sm cursor-default">
                    <Code className="w-4 h-4 text-indigo-500" /> {tech}
                </div>
            ))}
        </div>
    </section>
);

// 8. Testimonials
const Testimonials = ({ ref }) => (
    <section id="testimonials" ref={ref} className="py-24 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-16">Loved by Builders</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ReviewCard name="Alex C." role="CTO @ StartUp" text="The latency is insane. We replaced our old TTS provider and our user retention went up 40% immediately." />
            <ReviewCard name="Sarah J." role="Indie Game Dev" text="Finally, NPC voices that don't sound like robots. The emotion control is a game changer for RPGs." />
            <ReviewCard name="David K." role="Product Lead" text="Documentation is top tier. Had a prototype running in less than 15 minutes. Highly recommended." />
        </div>
    </section>
);

const ReviewCard = ({ name, role, text }) => (
    <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl relative">
        <Quote className="absolute top-8 right-8 text-white/10 w-8 h-8" />
        <p className="text-slate-300 mb-6 leading-relaxed">"{text}"</p>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white">{name[0]}</div>
            <div>
                <div className="text-white font-bold text-sm">{name}</div>
                <div className="text-slate-500 text-xs">{role}</div>
            </div>
        </div>
    </div>
);

// 9. Neural Search
const NeuralSearch = () => {
    const [query, setQuery] = useState('');
    return (
        <section className="py-20 px-4 max-w-4xl mx-auto">
            <div className="bg-gradient-to-b from-white/5 to-black border border-white/10 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />
                <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6"><Command className="w-6 h-6 text-indigo-400" /></div>
                    <h2 className="text-3xl font-bold text-white mb-4">Command Center</h2>
                    <p className="text-slate-400 mb-8">Explore documentation, find voice models, or jump to features instantly.</p>
                    <div className="relative max-w-lg mx-auto mb-8 group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
                        <div className="relative flex items-center bg-black rounded-xl border border-white/10 focus-within:border-white/30 transition-colors">
                            <Search className="w-5 h-5 text-slate-500 ml-4" />
                            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search 'Python SDK' or 'Latency'..." className="w-full bg-transparent border-none p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-0" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// 10. Pricing
const PricingAlbum = ({ ref }) => {
    const [annual, setAnnual] = useState(true);
    return (
        <section id="pricing" ref={ref} className="py-24 max-w-7xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-white text-center mb-8">Simple Pricing</h2>
            <div className="flex justify-center mb-12">
                <div className="bg-white/10 p-1 rounded-full flex relative">
                    <button onClick={() => setAnnual(false)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!annual ? 'bg-white text-black' : 'text-slate-400'}`}>Monthly</button>
                    <button onClick={() => setAnnual(true)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${annual ? 'bg-white text-black' : 'text-slate-400'}`}>Yearly</button>
                    {annual && <div className="absolute -right-20 top-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">SAVE 20%</div>}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <PricingCard title="Starter" price="$0" features={["10 mins/mo", "Standard Voices", "Personal Use"]} cta="Get Started" />
                <PricingCard title="Pro Creator" price={annual ? "$24" : "$29"} featured={true} features={["20 hours/mo", "Voice Cloning", "Commercial Rights"]} cta="Upgrade Now" />
                <PricingCard title="Enterprise" price="Custom" features={["Unlimited Scale", "Private Models", "SSO & SLA"]} cta="Contact Sales" />
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

// 11. FAQ
const FAQSection = ({ ref }) => (
    <section id="faq" ref={ref} className="py-20 max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
            <FAQItem q="Can I use the generated audio for commercial projects?" a="Yes! Our Pro plan and above includes full commercial rights for all generated audio." />
            <FAQItem q="What languages are supported?" a="We currently support 29 languages including English, Spanish, French, German, Japanese, and Arabic." />
            <FAQItem q="Can I clone my own voice?" a="Absolutely. Instant Voice Cloning is available on the Pro plan. It takes just 30 seconds of audio." />
            <FAQItem q="How do you handle API rate limits?" a="Enterprise plans have unlimited concurrency. Pro plans are capped at 50 concurrent streams." />
        </div>
    </section>
);

const FAQItem = ({ q, a }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors">
                <span className="font-bold text-slate-200">{q}</span>
                {isOpen ? <ChevronDown className="w-5 h-5 text-indigo-400 transform rotate-180 transition-transform" /> : <Plus className="w-5 h-5 text-slate-500 transition-transform" />}
            </button>
            {isOpen && <div className="p-4 pt-0 text-sm text-slate-400 leading-relaxed border-t border-white/5 bg-black/20">{a}</div>}
        </div>
    );
};

// 12. Final CTA
const FinalCallToAction = () => (
    <section className="px-4 mb-20 text-center">
        <h2 className="text-white text-2xl font-bold mb-6">Ready to find your voice?</h2>
        <Link to="/register" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold text-lg hover:underline underline-offset-4 transition-all">
            Create free account <ArrowRight className="w-5 h-5" />
        </Link>
    </section>
);

export default LandingPage;