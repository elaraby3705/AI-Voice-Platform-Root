import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { useLiveKitAuth } from '../hooks/useLiveKitAuth';

// --- LiveKit Imports ---
import {
    LiveKitRoom,
    RoomAudioRenderer,
    ControlBar,
    BarVisualizer,
    useTracks,
    useRoomContext,
} from '@livekit/components-react';
import { Track, RoomEvent } from 'livekit-client';
import '@livekit/components-styles';

// --- Icons ---
import {
    Play, Save, RotateCcw, Mic2, FileAudio, Wand2,
    MessageSquare, Activity, Wifi, Bot, User,
    Sliders, History, Sparkles, Download
} from 'lucide-react';

// ==========================================
// 1. HELPER: The "Ears" (Agent Visualizer)
// ==========================================
// This component listens specifically to the Remote Agent's track
const AgentVisualizer = () => {
    const tracks = useTracks([Track.Source.Microphone]);
    // Filter to find the track that is NOT me (the local user)
    const agentTrack = tracks.find(t => !t.participant.isLocal);

    return (
        <BarVisualizer
            state="connected"
            barCount={7}
            trackRef={agentTrack}
            className="h-full w-full !bg-transparent"
            options={{ minHeight: 20, maxHeight: 60 }}
        />
    );
};

// ==========================================
// 2. HELPER: The "Brain" (Live Transcript)
// ==========================================
// Handles real-time data packets from the AI Agent
const LiveTranscript = ({ initialMsg }) => {
    const room = useRoomContext();
    const [messages, setMessages] = useState([
        { sender: 'ai', text: initialMsg }
    ]);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!room) return;

        const handleData = (payload, participant) => {
            const str = new TextDecoder().decode(payload);
            try {
                // Try to parse JSON (e.g. { "type": "transcript", "text": "Hello" })
                const data = JSON.parse(str);
                if (data.type === 'transcript' || data.message) {
                    addMessage('ai', data.message || data.text);
                }
            } catch (e) {
                // Fallback: It's just a raw string
                addMessage('ai', str);
            }
        };

        room.on(RoomEvent.DataReceived, handleData);
        return () => {
            room.off(RoomEvent.DataReceived, handleData);
        };
    }, [room]);

    const addMessage = (sender, text) => {
        setMessages(prev => [...prev, { sender, text }]);
    };

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-[#050505] to-[#080808] scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                        msg.sender === 'ai'
                        ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/50'
                        : 'bg-slate-800 border-white/10'
                    }`}>
                        {msg.sender === 'ai' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                    </div>
                    {/* Bubble */}
                    <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === 'ai'
                        ? 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                        : 'bg-indigo-600 text-white rounded-tr-none shadow-lg'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
    );
};

// ==========================================
// 3. MAIN COMPONENT: Studio
// ==========================================
const Studio = () => {
    // UI States
    const [mode, setMode] = useState('text');
    const [text, setText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Voice Config States
    const [stability, setStability] = useState(50);
    const [clarity, setClarity] = useState(75);
    const [selectedVoice, setSelectedVoice] = useState('Sarah');

    // LiveKit Hook
    const { roomToken, wsUrl, error: lkError, isConnecting: lkConnecting } = useLiveKitAuth();

    // Text Mode Simulation
    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => setIsGenerating(false), 2500);
    };

    const enhancePrompt = (type) => {
        if (type === 'happy') setText(prev => prev + " [tone: cheerful] ");
        if (type === 'pause') setText(prev => prev + " <break time='1s'/> ");
    };

    return (
        <div className="flex min-h-screen bg-[#050505] selection:bg-indigo-500/30 font-sans text-white">
            <Sidebar />

            <main className="ml-64 flex-1 h-screen flex overflow-hidden">

                {/* --- LEFT PANEL: Configuration --- */}
                <div className="w-80 bg-[#080808] border-r border-white/10 p-6 flex flex-col gap-6 overflow-y-auto z-20">
                    <div>
                        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Neural Model</h2>
                        <div className="space-y-2">
                            {['Sarah', 'Marcus', 'Nova', 'Echo'].map(voice => (
                                <button
                                    key={voice}
                                    onClick={() => setSelectedVoice(voice)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group ${
                                        selectedVoice === voice
                                        ? 'bg-indigo-600/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${selectedVoice === voice ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                        {voice[0]}
                                    </div>
                                    <div className="text-left">
                                        <div className={`text-sm font-bold ${selectedVoice === voice ? 'text-white' : 'text-slate-300'}`}>{voice}</div>
                                        <div className="text-[10px] text-slate-500 group-hover:text-slate-400">Neural V2 • 48kHz</div>
                                    </div>
                                    {selectedVoice === voice && <div className="ml-auto w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Sliders className="w-3 h-3" /> Fine Tuning
                        </h2>
                        <div className="space-y-6">
                            <RangeSlider label="Stability" value={stability} setValue={setStability} color="indigo" />
                            <RangeSlider label="Clarity Boost" value={clarity} setValue={setClarity} color="purple" />
                        </div>
                    </div>
                </div>

                {/* --- CENTER STAGE: Workspace --- */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">

                    {/* Toolbar */}
                    <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur-md z-30">
                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                            <TabButton active={mode === 'text'} onClick={() => setMode('text')} icon={MessageSquare} label="Text to Speech" />
                            <TabButton active={mode === 'voice'} onClick={() => setMode('voice')} icon={Mic2} label="Live Voice" />
                        </div>
                        <div className="flex gap-2">
                            <ActionBtn icon={Save} />
                            <ActionBtn icon={RotateCcw} />
                        </div>
                    </div>

                    {/* --- MODE A: Text Editor --- */}
                    {mode === 'text' && (
                        <>
                            <div className="flex-1 p-8 relative group">
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Enter your script for synthesis..."
                                    className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-xl text-white/90 placeholder:text-white/20 font-light leading-relaxed font-mono"
                                />
                                <div className="absolute bottom-8 left-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Chip label="+ Add Pause" onClick={() => enhancePrompt('pause')} />
                                    <Chip label="+ Make Cheerful" onClick={() => enhancePrompt('happy')} />
                                </div>
                            </div>
                            <div className="h-24 border-t border-white/10 bg-[#080808] px-8 flex items-center justify-between relative overflow-hidden">
                                {isGenerating && <GeneratingWave />}
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

                    {/* --- MODE B: Live Voice (The 80/20 Split) --- */}
                    {mode === 'voice' && (
                        <div className="flex-1 flex flex-col relative">
                            {lkConnecting ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-4 h-4 text-indigo-400" /></div>
                                    </div>
                                    <span className="animate-pulse font-mono text-xs">ESTABLISHING NEURAL LINK...</span>
                                </div>
                            ) : lkError ? (
                                <div className="flex-1 flex items-center justify-center text-rose-500 gap-3">
                                    <Wifi className="w-5 h-5" /> Connection Failed
                                </div>
                            ) : (
                                <LiveKitRoom
                                    video={false}
                                    audio={true}
                                    token={roomToken}
                                    serverUrl={wsUrl}
                                    data-lk-theme="default"
                                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                >
                                    <RoomAudioRenderer />

                                    {/* 80% TOP: Transcript */}
                                    <LiveTranscript initialMsg={`Nexus systems online. ${selectedVoice} is listening...`} />

                                    {/* 20% BOTTOM: Control Deck */}
                                    <div className="h-48 border-t border-white/10 bg-[#060606] relative flex flex-col items-center justify-center p-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">

                                        {/* Background Visualizer */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                                            <div className="w-1/2 h-24">
                                                <AgentVisualizer />
                                            </div>
                                        </div>

                                        {/* Controls */}
                                        <div className="relative z-10 flex flex-col items-center gap-4">
                                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] animate-pulse">
                                                Live Session • {selectedVoice} Active
                                            </div>

                                            <div className="bg-white/5 p-2 px-8 rounded-full border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors shadow-2xl">
                                                <ControlBar
                                                    variation="minimal"
                                                    controls={{ microphone: true, camera: false, screenShare: false, leave: false }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </LiveKitRoom>
                            )}
                        </div>
                    )}
                </div>

                {/* --- RIGHT PANEL: History --- */}
                <div className="w-72 bg-[#0A0A0A] border-l border-white/10 flex flex-col z-20">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <History className="w-3 h-3" /> Recent Activity
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        <HistoryItem text="Welcome to the future of AI..." voice="Sarah" time="2m ago" />
                        <HistoryItem text="Diagnostic complete." voice="Marcus" time="1h ago" />
                    </div>
                </div>

            </main>

            {/* Global Overrides */}
            <style>{`
                .lk-control-bar { background: transparent !important; border: none !important; padding: 0 !important; }
                .lk-button { background-color: rgba(255,255,255,0.05) !important; height: 48px !important; width: 48px !important; border-radius: 50% !important; }
                .lk-button:hover { background-color: rgba(99,102,241,0.5) !important; }
                .lk-button-group { gap: 1rem !important; }
                .lk-device-menu { display: none !important; }
            `}</style>
        </div>
    );
};

// --- Sub-Components ---
const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button onClick={onClick} className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${active ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>
        <Icon className="w-3 h-3" /> {label}
    </button>
);
const RangeSlider = ({ label, value, setValue, color }) => (
    <div>
        <div className="flex justify-between mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
            <span className={`text-xs text-${color}-400 font-mono font-bold`}>{value}%</span>
        </div>
        <input type="range" min="0" max="100" value={value} onChange={(e) => setValue(e.target.value)} className={`w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-${color}-500 hover:accent-${color}-400`} />
    </div>
);
const GeneratingWave = () => (
    <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20 pointer-events-none">
        {[...Array(40)].map((_, i) => (
            <div key={i} className="w-2 bg-indigo-500 rounded-full animate-pulse" style={{height: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s`}} />
        ))}
    </div>
);
const HistoryItem = ({ text, voice, time }) => (
    <div className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 cursor-pointer group transition-all">
        <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] font-bold text-white flex items-center gap-1.5 bg-black/20 px-1.5 py-0.5 rounded"><FileAudio className="w-3 h-3 text-indigo-400" /> {voice}</div>
            <div className="text-[9px] text-slate-500 font-mono">{time}</div>
        </div>
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3 font-medium">"{text}"</p>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="flex-1 py-1.5 bg-indigo-500 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-400">Play</button>
            <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"><Download className="w-3 h-3" /></button>
        </div>
    </div>
);
const ActionBtn = ({ icon: Icon }) => (
    <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><Icon className="w-4 h-4" /></button>
);
const Chip = ({ label, onClick }) => (
    <button onClick={onClick} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all backdrop-blur-md">{label}</button>
);

export default Studio;