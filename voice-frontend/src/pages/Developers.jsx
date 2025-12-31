import { useState } from 'react';
import { Copy, Eye, EyeOff, Key, Terminal, RefreshCw, CheckCircle2 } from 'lucide-react';

const Developers = () => {
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);

    // Mock API Key
    const apiKey = "sk_live_51Mx92...492x8";

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen pt-24 px-4 md:px-8 pb-10 bg-black text-white">
            <div className="max-w-4xl mx-auto space-y-10">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Developer Settings</h1>
                    <p className="text-slate-400 text-sm font-mono">
                        MANAGE API ACCESS & INTEGRATIONS
                    </p>
                </div>

                {/* API Key Section */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-4 text-white font-semibold">
                        <Key className="w-5 h-5 text-indigo-400" />
                        <h2>Production API Key</h2>
                    </div>
                    <p className="text-slate-400 text-sm mb-6">
                        This key grants full access to your account. Keep it secret.
                        Do not share it in client-side code.
                    </p>

                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-slate-300 flex items-center justify-between group focus-within:border-indigo-500/50 transition-colors">
                            <span>
                                {showKey ? "sk_live_51Mx92jK29sJ29s21938492x8" : "sk_live_•••••••••••••••••••••••••"}
                            </span>
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="text-slate-500 hover:text-white transition-colors"
                            >
                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="bg-white text-black font-bold px-4 py-3 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2 min-w-[100px] justify-center"
                        >
                            {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied" : "Copy"}
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                        <div className="text-xs text-slate-500">
                            Last used: <span className="text-slate-300">2 minutes ago</span>
                        </div>
                        <button className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 hover:underline decoration-red-400/30 underline-offset-4">
                            <RefreshCw className="w-3 h-3" /> Roll Key
                        </button>
                    </div>
                </div>

                {/* Quick Start Documentation */}
                <div className="bg-black border border-white/10 rounded-2xl overflow-hidden">
                    <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-mono text-slate-400">cURL Example</span>
                    </div>
                    <div className="p-6 font-mono text-sm overflow-x-auto text-indigo-100/90">
                        <pre>
{`curl -X POST https://api.voiceai.com/v1/synthesize \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hello world",
    "voice_id": "sarah",
    "model_id": "eleven_turbo_v2"
  }'`}
                        </pre>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Developers;