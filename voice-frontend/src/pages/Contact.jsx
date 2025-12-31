import { useState } from 'react';
import { Mail, MapPin, MessageSquare, Send, Globe, Phone } from 'lucide-react';

const Contact = () => {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSending(true);
        // Simulate sending
        setTimeout(() => {
            setSending(false);
            setSent(true);
            setForm({ name: '', email: '', message: '' });
        }, 1500);
    };

    return (
        <div className="min-h-screen pt-24 px-4 md:px-8 pb-10 bg-black text-white relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">

                {/* Left Column: Info */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-4">Establish Connection</h1>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Have questions about enterprise deployment, API limits, or custom voice cloning?
                            Our neural operators are standing by.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-colors">
                            <div className="p-3 rounded-lg bg-indigo-500/20 text-indigo-400">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Electronic Mail</h3>
                                <p className="text-sm text-slate-400 mb-1">General Inquiries</p>
                                <a href="mailto:hello@voiceai.com" className="text-indigo-400 hover:text-indigo-300 font-mono text-sm">hello@voiceai.com</a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-colors">
                            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">HQ Coordinates</h3>
                                <p className="text-sm text-slate-400 mb-1">Global Operations</p>
                                <p className="text-slate-300 font-mono text-sm">
                                    Sector 7, Tech District<br />
                                    Cairo, Egypt
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-colors">
                            <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Social Frequency</h3>
                                <div className="flex gap-4 mt-2">
                                    <a href="#" className="text-slate-400 hover:text-white transition-colors">Twitter</a>
                                    <a href="#" className="text-slate-400 hover:text-white transition-colors">LinkedIn</a>
                                    <a href="#" className="text-slate-400 hover:text-white transition-colors">GitHub</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Contact Form */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-400" /> Send Transmission
                    </h3>

                    {sent ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                                <Send className="w-8 h-8 text-green-400" />
                            </div>
                            <h4 className="text-xl font-bold text-white">Transmission Received</h4>
                            <p className="text-slate-400 text-sm">We will respond to your frequency shortly.</p>
                            <button onClick={() => setSent(false)} className="text-indigo-400 hover:text-indigo-300 text-sm underline">Send another message</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase tracking-widest text-slate-500">Identity (Name)</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({...form, name: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    placeholder="Commander Shepard"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase tracking-widest text-slate-500">Return Address (Email)</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({...form, email: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    placeholder="name@company.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase tracking-widest text-slate-500">Message Payload</label>
                                <textarea
                                    required
                                    rows="5"
                                    value={form.message}
                                    onChange={(e) => setForm({...form, message: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                                    placeholder="Describe your inquiry..."
                                ></textarea>
                            </div>

                            <button
                                disabled={sending}
                                className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {sending ? 'Transmitting...' : <>Send Message <Send className="w-4 h-4" /></>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contact;