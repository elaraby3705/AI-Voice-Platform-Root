import { Check, CreditCard, Zap, Shield } from 'lucide-react';

const Billing = () => {
    return (
        <div className="min-h-screen pt-24 px-4 md:px-8 pb-10 bg-black text-white">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Billing & Plans</h1>
                    <p className="text-slate-400 text-sm font-mono">
                        MANAGE SUBSCRIPTION & CREDITS
                    </p>
                </div>

                {/* Current Usage Section */}
                <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-2xl p-8 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 rounded-full bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider">Pro Plan</span>
                                <span className="text-slate-400 text-xs">Renews Nov 24, 2025</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">Your Credits</h2>
                            <p className="text-indigo-200 text-sm">You have used 65% of your monthly allocation.</p>
                        </div>

                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-bold transition-colors">
                                View Invoices
                            </button>
                            <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20">
                                Buy Credits
                            </button>
                        </div>
                    </div>

                    {/* Usage Bar */}
                    <div className="mt-8 relative z-10">
                        <div className="flex justify-between text-xs font-mono mb-2 text-indigo-300">
                            <span>13,500 chars used</span>
                            <span>20,000 chars limit</span>
                        </div>
                        <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[65%] rounded-full relative">
                                <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Starter Plan */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
                        <div className="mb-4">
                            <h3 className="font-bold text-lg">Starter</h3>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-2xl font-bold">$0</span>
                                <span className="text-slate-500 text-sm">/mo</span>
                            </div>
                            <p className="text-slate-400 text-sm mt-2">For hobbyists and testing.</p>
                        </div>
                        <ul className="space-y-3 mb-8 text-sm text-slate-300">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 1,000 characters/mo</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Standard Voices</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Public API Access</li>
                        </ul>
                        <button className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-bold hover:bg-white/10">
                            Downgrade
                        </button>
                    </div>

                    {/* Pro Plan (Active) */}
                    <div className="bg-black border-2 border-indigo-500 rounded-2xl p-6 relative transform md:-translate-y-4 shadow-2xl shadow-indigo-900/20">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                            Most Popular
                        </div>
                        <div className="mb-4">
                            <h3 className="font-bold text-lg text-indigo-400">Pro</h3>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-3xl font-bold text-white">$29</span>
                                <span className="text-slate-400 text-sm">/mo</span>
                            </div>
                            <p className="text-slate-400 text-sm mt-2">For creators and developers.</p>
                        </div>
                        <ul className="space-y-3 mb-8 text-sm text-slate-300">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> 20,000 characters/mo</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> <Zap className="w-3 h-3 fill-current" /> Ultra-low Latency</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Premium Voices</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Commercial Rights</li>
                        </ul>
                        <button className="w-full py-3 bg-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-500 transition-colors text-white">
                            Current Plan
                        </button>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
                        <div className="mb-4">
                            <h3 className="font-bold text-lg">Enterprise</h3>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-2xl font-bold">$99</span>
                                <span className="text-slate-500 text-sm">/mo</span>
                            </div>
                            <p className="text-slate-400 text-sm mt-2">For high-scale applications.</p>
                        </div>
                        <ul className="space-y-3 mb-8 text-sm text-slate-300">
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited characters</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Custom Voice Clones</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> <Shield className="w-3 h-3" /> SLA Guarantee</li>
                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Dedicated Support</li>
                        </ul>
                        <button className="w-full py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-slate-200">
                            Contact Sales
                        </button>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="border-t border-white/10 pt-8">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-slate-400" /> Payment Method
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/10 p-2 rounded">
                                <div className="w-8 h-5 bg-white rounded-sm opacity-80" />
                            </div>
                            <div>
                                <div className="text-sm font-mono text-white">Visa ending in 4242</div>
                                <div className="text-xs text-slate-500">Expires 12/2028</div>
                            </div>
                        </div>
                        <button className="text-sm text-indigo-400 hover:text-indigo-300 font-bold">Edit</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Billing;