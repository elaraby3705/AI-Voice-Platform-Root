import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useLiveKitAuth } from '../hooks/useLiveKitAuth';

// --- 1. Import LiveKit & Visualizer Requirements ---
import {
    LiveKitRoom,
    RoomAudioRenderer,
    ControlBar,
    BarVisualizer,
    useTracks
} from '@livekit/components-react';
import { Track } from 'livekit-client'; // Required to identify audio source
import '@livekit/components-styles';

import {
    Play, Download, Sliders, History,
    Save, RotateCcw, Mic2, FileAudio, Wand2,
    MessageSquare, Activity, Wifi
} from 'lucide-react';

// --- 2. Helper Component for Visualization (The Fix) ---
// This component finds the AI's audio track so the bars actually move
const AgentVisualizer = () => {
    // Get all microphone tracks in the room
    const tracks = useTracks([Track.Source.Microphone]);

    // Find the track that does NOT belong to "me" (i.e., the AI Agent)
    const agentTrack = tracks.find(t => t.participant.identity !== "me");

    return (
        <BarVisualizer
            state="connected"
            barCount={7}
            trackRef={agentTrack} // Bind the visualizer to the Agent's voice
            className="h-full w-full !bg-transparent"
        />
    );
};

const Studio = () => {
    const [mode, setMode] = useState('text'); // 'text' or 'voice'

    // --- Text States ---
    const [text, setText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [stability, setStability] = useState(50);
    const [clarity, setClarity] = useState(75);
    const [selectedVoice, setSelectedVoice] = useState('Sarah');

    // --- LiveKit Logic ---
    const { roomToken, wsUrl, error: lkError, isConnecting: lkConnecting } = useLiveKitAuth();

    // Text Gen Simulation
    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => setIsGenerating(false), 3000);
    };

    const enhancePrompt = (type) => {
        if (type === 'happy') setText(prev => prev + " [tone: cheerful] ");
        if (type === 'pause') setText(prev => prev + " <break time='1s'/> ");
    };

    return (
        <div className="flex min-h-screen bg-[#050505] selection:bg-indigo-500/30">
            <Sidebar />
            <main className="ml-64 flex-1 h-screen flex overflow-hidden">

                {/* --- LEFT: Config Panel --- */}
                <div className="w-80 bg-[#080808] border-r border-white/10 p-6 flex flex-col gap-8 overflow-y-auto z-20">
                    <div>
                        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Voice Model</h2>
                        <div className="space-y-2">
                            {['Sarah', 'Marcus', 'Nova', 'Echo'].map(voice => (
                                <button
                                    key={voice}
                                    onClick={() => setSelectedVoice(voice)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                                        selectedVoice === voice
                                        ? 'bg-indigo-600/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${selectedVoice === voice ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                        {voice[0]}
                                    </div>
                                    <div className="text-left">
                                        <div className={`text-sm font-bold transition-colors ${selectedVoice === voice ? 'text-white' : 'text-slate-300'}`}>{voice}</div>
                                        <div className="text-[10px] text-slate-500">Neural V2 • 48kHz</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Sliders className="w-3 h-3" /> Tuning
                        </h2>
                        <div className="space-y-6">
                            <RangeSlider label="Stability" value={stability} setValue={setStability} />
                            <RangeSlider label="Clarity Boost" value={clarity} setValue={setClarity} />
                        </div>
                    </div>
                </div>

                {/* --- CENTER: Editor / Live Room --- */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">

                    {/* Toolbar & Mode Switcher */}
                    <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#050505]/50 backdrop-blur-sm z-10">
                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                            <button
                                onClick={() => setMode('text')}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${mode === 'text' ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                <MessageSquare className="w-3 h-3" /> Text to Speech
                            </button>
                            <button
                                onClick={() => setMode('voice')}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${mode === 'voice' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Mic2 className="w-3 h-3" /> Live Voice
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <ActionBtn icon={Save} />
                            <ActionBtn icon={RotateCcw} />
                        </div>
                    </div>

                    {/* 🟢 MODE A: TEXT EDITOR */}
                    {mode === 'text' && (
                        <>
                            <div className="flex-1 p-8 relative group">
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Type your script here..."
                                    className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-xl text-white/90 placeholder:text-white/10 font-light leading-loose font-mono"
                                />
                                <div className="absolute bottom-8 left-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Chip label="+ Add Pause" onClick={() => enhancePrompt('pause')} />
                                    <Chip label="+ Make Cheerful" onClick={() => enhancePrompt('happy')} />
                                </div>
                            </div>

                            <div className="h-24 border-t border-white/10 bg-[#080808] px-8 flex items-center justify-between relative overflow-hidden">
                                {isGenerating && (
                                    <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20 pointer-events-none">
                                        {[...Array(40)].map((_, i) => (
                                            <div key={i} className="w-2 bg-indigo-500 rounded-full animate-wave" style={{height: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s`}} />
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-center gap-6 z-10">
                                    <div className="text-xs text-slate-500 font-mono flex gap-4">
                                        <span>{text.length} chars</span>
                                        <span>~{(text.length / 15).toFixed(1)}s est.</span>
                                    </div>
                                </div>
                                <button onClick={handleGenerate} disabled={isGenerating} className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg z-10 ${isGenerating ? "bg-indigo-500/20 text-indigo-400 cursor-wait" : "bg-white text-black hover:scale-105"}`}>
                                    {isGenerating ? <><Wand2 className="w-4 h-4 animate-spin" /> Synthesizing...</> : <><Play className="w-4 h-4 fill-black" /> Generate Audio</>}
                                </button>
                            </div>
                        </>
                    )}

                    {/* 🔴 MODE B: LIVEKIT VOICE ROOM */}
                    {mode === 'voice' && (
                        <div className="flex-1 flex flex-col relative">
                            {lkConnecting ? (
                                <div className="flex-1 flex items-center justify-center text-slate-500 gap-3 animate-pulse">
                                    <Activity className="w-5 h-5 animate-spin" /> Connecting to Neural Core...
                                </div>
                            ) : lkError ? (
                                <div className="flex-1 flex items-center justify-center text-rose-500 gap-3">
                                    <Wifi className="w-5 h-5" /> Connection Failed
                                </div>
                            ) : (
                                /* THE LIVEKIT ROOM WRAPPER */
                                <LiveKitRoom
                                    video={false}
                                    audio={true}
                                    token={roomToken}
                                    serverUrl={wsUrl}
                                    data-lk-theme="default"
                                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                >
                                    <RoomAudioRenderer />

                                    {/* Visualization Area */}
                                    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

                                        <div className="relative z-10 w-full max-w-lg h-64 flex flex-col items-center justify-center gap-6">
                                            <div className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] animate-pulse">
                                                Live Session Active
                                            </div>

                                            {/* --- 3. Fixed Visualizer Container --- */}
                                            {/* Wraps the visualizer in a fixed size div to solve 'width(-1)' warning */}
                                            <div className="h-32 w-full flex items-center justify-center">
                                                 <div style={{ width: '100%', height: '100%' }}>
                                                     <AgentVisualizer />
                                                 </div>
                                            </div>

                                            <div className="text-slate-500 text-sm font-mono">
                                                Speak now. Nexus is listening...
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Control Bar (Voice) */}
                                    <div className="h-24 border-t border-white/10 bg-[#080808] flex items-center justify-center z-10">
                                        <div className="bg-white/5 p-2 px-6 rounded-full border border-white/10 backdrop-blur-md">
                                            <ControlBar variation="minimal" controls={{ microphone: true, camera: false, screenShare: false, leave: false }} />
                                        </div>
                                    </div>
                                </LiveKitRoom>
                            )}
                        </div>
                    )}
                </div>

                {/* --- RIGHT: History --- */}
                <div className="w-72 bg-[#0A0A0A] border-l border-white/10 flex flex-col z-20">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <History className="w-3 h-3" /> History
                        </h2>
                        <button className="text-[10px] text-indigo-400 hover:text-indigo-300">View All</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        <HistoryItem text="Welcome to the future of AI..." voice="Sarah" time="2m ago" />
                        <HistoryItem text="System failure detected on pod..." voice="Marcus" time="1h ago" />
                        <HistoryItem text="Testing the neural engine..." voice="Nova" time="1d ago" />
                    </div>
                </div>

            </main>

            <style>{`
                @keyframes wave {
                    0%, 100% { transform: scaleY(0.5); }
                    50% { transform: scaleY(1.5); }
                }
                .animate-wave {
                    animation-name: wave;
                    animation-iteration-count: infinite;
                    animation-timing-function: ease-in-out;
                }
                .lk-control-bar {
                    background: transparent !important;
                    border: none !important;
                }
                .lk-button {
                    background-color: rgba(255,255,255,0.1) !important;
                }
            `}</style>
        </div>
    );
};

// --- Sub Components ---
const ActionBtn = ({ icon: Icon }) => (
    <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
        <Icon className="w-4 h-4" />
    </button>
);

const Chip = ({ label, onClick }) => (
    <button
        onClick={onClick}
        className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all backdrop-blur-md"
    >
        {label}
    </button>
);

const RangeSlider = ({ label, value, setValue }) => (
    <div>
        <div className="flex justify-between mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
            <span className="text-xs text-indigo-400 font-mono font-bold">{value}%</span>
        </div>
        <input
            type="range" min="0" max="100" value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
        />
    </div>
);

const HistoryItem = ({ text, voice, time }) => (
    <div className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 cursor-pointer group transition-all">
        <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] font-bold text-white flex items-center gap-1.5 bg-black/20 px-1.5 py-0.5 rounded">
                <FileAudio className="w-3 h-3 text-indigo-400" /> {voice}
            </div>
            <div className="text-[9px] text-slate-500 font-mono">{time}</div>
        </div>
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3 font-medium">"{text}"</p>
        <div className="flex gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
            <button className="flex-1 py-1.5 bg-indigo-500 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/20">Play</button>
            <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"><Download className="w-3 h-3" /></button>
        </div>
    </div>
);

export default Studio;