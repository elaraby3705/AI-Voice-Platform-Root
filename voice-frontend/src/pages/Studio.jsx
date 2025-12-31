import { useState } from 'react';
import { Play, Download, Save, Mic, Settings, Layers, Zap } from 'lucide-react';

const Studio = () => {
    const [text, setText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('sarah');
    const [stability, setStability] = useState(50);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
        // Simulate API call
        setTimeout(() => setIsGenerating(false), 2000);
    };

    return (
        <div className="min-h-screen pt-24 px-4 md:px-8 pb-10 bg-black text-white">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Panel: Controls */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Voice Selection */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-4 text-indigo-400">
                            <Mic className="w-5 h-5" />
                            <h3 className="font-bold text-sm uppercase tracking-wider">Voice Model</h3>
                        </div>
                        <select
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                        >
                            <option value="sarah">Sarah (American, Professional)</option>
                            <option value="adam">Adam (British, Deep)</option>
                            <option value="marcus">Marcus (African American, Energetic)</option>
                            <option value="nova">Nova (AI Assistant, Neutral)</option>
                        </select>
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                            <Zap className="w-3 h-3 text-yellow-400" /> Premium voices enabled
                        </div>
                    </div>

                    {/* AI Settings */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-6 text-indigo-400">
                            <Settings className="w-5 h-5" />
                            <h3 className="font-bold text-sm uppercase tracking-wider">Configuration</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-slate-300">Stability</span>
                                    <span className="text-indigo-400">{stability}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={stability}
                                    onChange={(e) => setStability(e.target.value)}
                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rounded-full"
                                />
                                <p className="text-[10px] text-slate-500 mt-2">Higher stability makes the voice more consistent but less emotional.</p>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-slate-300">Clarity + Similarity</span>
                                    <span className="text-indigo-400">75%</span>
                                </div>
                                <div className="w-full h-1 bg-white/10 rounded-lg overflow-hidden">
                                    <div className="w-3/4 h-full bg-indigo-500"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Text Input & Preview */}
                <div className="lg:col-span-2 flex flex-col h-full min-h-[500px]">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-sm flex flex-col relative overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">

                        {/* Editor Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/20">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Layers className="w-4 h-4" /> Script Editor
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">
                                {text.length} CHARS
                            </div>
                        </div>

                        {/* Text Area */}
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type or paste your text here to synthesize..."
                            className="flex-1 w-full bg-transparent p-6 text-lg leading-relaxed text-white placeholder:text-slate-600 focus:outline-none resize-none font-sans"
                            spellCheck="false"
                        />

                        {/* Action Bar */}
                        <div className="p-4 border-t border-white/5 bg-black/20 flex items-center justify-between">
                            <button className="text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <Save className="w-4 h-4" /> Save Draft
                            </button>

                            <button
                                onClick={handleGenerate}
                                disabled={!text || isGenerating}
                                className="px-6 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Synthesizing...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 fill-current" /> Generate Audio
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Output/Result Area (Shows after generation) */}
                    <div className="mt-6 bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white hover:bg-indigo-400 transition-colors">
                                <Play className="w-4 h-4 fill-current pl-0.5" />
                            </button>
                            <div className="bg-black/20 h-8 w-64 rounded flex items-center justify-center">
                                {/* Fake Waveform */}
                                <div className="flex items-center gap-0.5 h-full px-2">
                                    {[...Array(20)].map((_, i) => (
                                        <div key={i} className="w-1 bg-indigo-500/50 rounded-full" style={{ height: `${Math.random() * 100}%` }} />
                                    ))}
                                </div>
                            </div>
                            <span className="text-xs font-mono text-indigo-300">00:00 / 00:12</span>
                        </div>
                        <button className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Studio;