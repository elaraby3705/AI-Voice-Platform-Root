import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
    Play, Mic2, Wand2, MessageSquare, Wifi, Bot, User,
    Sliders, History, Sparkles, Download, ArrowLeft,
    UploadCloud, FileText, X, CheckCircle2
} from 'lucide-react';

// ==========================================
// 1. HELPER: The "Ears" (Agent Visualizer)
// ==========================================
const AgentVisualizer = () => {
    const tracks = useTracks([Track.Source.Microphone]);
    const agentTrack = tracks.find(t => !t.participant.isLocal);

    if (!agentTrack) return <div className="text-[10px] text-slate-600">Waiting for audio...</div>;

    return (
        <BarVisualizer
            state="connected"
            barCount={7}
            trackRef={agentTrack}
            className="h-full w-full !bg-transparent"
            options={{ minHeight: 10, maxHeight: 50 }}
        />
    );
};

// ==========================================
// 2. HELPER: The "Brain" (Live Transcript)
// ==========================================
const LiveTranscript = ({ selectedVoice }) => {
    const room = useRoomContext();
    const [messages, setMessages] = useState([
        { sender: 'ai', text: `Nexus systems online. ${selectedVoice} model active.` }
    ]);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!room) return;

        const handleData = (payload) => {
            const str = new TextDecoder().decode(payload);
            try {
                const data = JSON.parse(str);
                if (data.type === 'transcript') {
                    setMessages(prev => [...prev, {
                        sender: data.sender,
                        text: data.text
                    }]);
                }
            } catch (e) {
                console.error("Failed to parse transcript:", e);
            }
        };

        room.on(RoomEvent.DataReceived, handleData);
        return () => {
            room.off(RoomEvent.DataReceived, handleData);
        };
    }, [room]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                        msg.sender === 'ai'
                        ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/50'
                        : 'bg-slate-800 border-white/10'
                    }`}>
                        {msg.sender === 'ai' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                    </div>
                    <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === 'ai'
                        ? 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                        : 'bg-indigo-600 text-white rounded-tr-none shadow-lg'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            <div ref={bottomRef} className="h-4" />
        </div>
    );
};

// ==========================================
// 3. MAIN COMPONENT: Studio
// ==========================================
const Studio = () => {
    // URL State Management
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const projectId = searchParams.get('project') || 'default';
    const voiceId = searchParams.get('voice') || 'Sarah';

    // UI States
    const [mode, setMode] = useState('voice');
    const [text, setText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // PDF & Audio States
    const [uploadedFile, setUploadedFile] = useState(null);
    const [generatedAudioUrl, setGeneratedAudioUrl] = useState(null);

    // Voice Config
    const [stability, setStability] = useState(50);
    const [clarity, setClarity] = useState(75);

    // LiveKit Logic
    const { roomToken, wsUrl, error: lkError, isConnecting: lkConnecting } = useLiveKitAuth();

    // --- Handlers ---

    const handleVoiceChange = (newVoice) => {
        setSearchParams({ project: projectId, voice: newVoice });
    };

    const handleLeave = () => {
        // Navigating away unmounts the component, which triggers
        // the cleanup in useLiveKitAuth, effectively killing the session.
        navigate('/projects');
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedFile(file);
            setText(`[Processing PDF: ${file.name}]...`);
            // Here you would normally send the file to your Django backend
            // For now, we simulate extraction:
            setTimeout(() => {
                setText((prev) => prev + "\n\nExtracted content from PDF would appear here ready for synthesis.");
            }, 1000);
        }
    };

    const handleGenerate = () => {
        if (!text) return;
        setIsGenerating(true);
        setGeneratedAudioUrl(null); // Reset previous audio

        // Simulate API call delay
        setTimeout(() => {
            setIsGenerating(false);
            // In a real app, this URL comes from your Django backend
            // For demo, we use a sample audio file
            setGeneratedAudioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
        }, 2500);
    };

    return (
        <div className="flex h-screen bg-[#050505] selection:bg-indigo-500/30 font-sans text-white overflow-hidden">
            <Sidebar />

            <main className="ml-64 flex-1 h-full flex flex-row overflow-hidden">

                {/* --- LEFT PANEL: Configuration --- */}
                <div className="w-80 bg-[#080808] border-r border-white/10 p-6 flex flex-col gap-6 overflow-y-auto z-20">
                    <button onClick={handleLeave} className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors mb-2">
                        <ArrowLeft className="w-3 h-3" /> Back to Projects
                    </button>

                    <div>
                        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Neural Model</h2>
                        <div className="space-y-2">
                            {['Sarah', 'Marcus', 'Nova', 'Echo'].map(voice => (
                                <button
                                    key={voice}
                                    onClick={() => handleVoiceChange(voice)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group ${
                                        voiceId === voice
                                        ? 'bg-indigo-600/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${voiceId === voice ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                        {voice[0]}
                                    </div>
                                    <div className="text-left">
                                        <div className={`text-sm font-bold ${voiceId === voice ? 'text-white' : 'text-slate-300'}`}>{voice}</div>
                                        <div className="text-[10px] text-slate-500 group-hover:text-slate-400">Neural V2 • 48kHz</div>
                                    </div>
                                    {voiceId === voice && <div className="ml-auto w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
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
                <div className="flex-1 flex flex-col min-w-0 bg-[#050505] relative h-full">

                    {/* Toolbar */}
                    <div className="h-16 flex-none border-b border-white/10 flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur-md z-30">
                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                            <TabButton active={mode === 'voice'} onClick={() => setMode('voice')} icon={Mic2} label="Live Session" />
                            <TabButton active={mode === 'text'} onClick={() => setMode('text')} icon={MessageSquare} label="PDF to Audio" />
                        </div>
                        <div className="flex gap-2">
                            <div className="text-xs text-slate-500 font-mono flex items-center gap-2 px-4">
                                <span className={`w-2 h-2 rounded-full ${mode === 'voice' && !lkError ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></span>
                                {mode === 'voice' ? 'System Online' : 'Text Mode'}
                            </div>
                        </div>
                    </div>

                    {/* --- MODE A: PDF / Text to Audio --- */}
                    {mode === 'text' && (
                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                            <div className="flex-1 p-8 relative flex flex-col gap-4">

                                {/* Upload Area */}
                                <div className="flex-none">
                                    <label className={`flex items-center gap-4 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploadedFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/5'}`}>
                                        <input type="file" className="hidden" accept=".pdf,.txt,.docx" onChange={handleFileUpload} />
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${uploadedFile ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
                                            {uploadedFile ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <UploadCloud className="w-5 h-5 text-indigo-400" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-slate-200">
                                                {uploadedFile ? uploadedFile.name : "Upload Document (PDF)"}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {uploadedFile ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to convert` : "Drag & drop or click to browse"}
                                            </div>
                                        </div>
                                        {uploadedFile && (
                                            <button onClick={(e) => { e.preventDefault(); setUploadedFile(null); setText(''); }} className="p-2 hover:bg-white/10 rounded-full">
                                                <X className="w-4 h-4 text-slate-400" />
                                            </button>
                                        )}
                                    </label>
                                </div>

                                {/* Text Area */}
                                <div className="flex-1 relative group bg-white/5 rounded-xl border border-white/5 focus-within:border-indigo-500/30 transition-colors p-4">
                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="Or type your script here..."
                                        className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-lg text-white/90 placeholder:text-white/20 font-light leading-relaxed font-mono custom-scrollbar"
                                    />
                                </div>
                            </div>

                            {/* Audio Player & Generation Controls */}
                            <div className="flex-none border-t border-white/10 bg-[#080808] p-8 space-y-4">

                                {generatedAudioUrl && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex items-center gap-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                                            <Play className="w-5 h-5 text-white fill-white ml-1" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-bold text-indigo-300 uppercase tracking-wide mb-1">Generated Audio</div>
                                            <audio controls src={generatedAudioUrl} className="w-full h-8 opacity-80" />
                                        </div>
                                        <a href={generatedAudioUrl} download="nexus_audio_export.mp3" className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors" title="Download Audio">
                                            <Download className="w-5 h-5" />
                                        </a>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        {isGenerating && <GeneratingWave />}
                                        {!isGenerating && <div className="text-xs text-slate-500 font-mono">{text.length} chars • ~{(text.length / 15).toFixed(1)}s est.</div>}
                                    </div>
                                    <button onClick={handleGenerate} disabled={isGenerating || !text} className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg z-10 ${isGenerating ? "bg-indigo-500/20 text-indigo-400 cursor-wait" : "bg-white text-black hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"}`}>
                                        {isGenerating ? <><Wand2 className="w-4 h-4 animate-spin" /> Synthesizing...</> : <><Sparkles className="w-4 h-4 fill-black" /> Generate Audio</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- MODE B: Live Voice --- */}
                    {mode === 'voice' && (
                        <div className="flex-1 flex flex-col h-full relative">
                            {lkConnecting || !roomToken ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-6 h-6 text-indigo-400" /></div>
                                    </div>
                                    <span className="animate-pulse font-mono text-xs tracking-widest">INITIALIZING {voiceId.toUpperCase()}...</span>
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
                                    connect={true}
                                    data-lk-theme="default"
                                    className="flex flex-col h-full"
                                >
                                    <RoomAudioRenderer />
                                    <LiveTranscript selectedVoice={voiceId} />
                                    <div className="h-48 flex-none border-t border-white/10 bg-[#060606] relative flex flex-col items-center justify-center p-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                                        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                                            <div className="w-1/2 h-24">
                                                <AgentVisualizer />
                                            </div>
                                        </div>
                                        <div className="relative z-10 flex flex-col items-center gap-4">
                                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] animate-pulse">
                                                Live Session • {voiceId} Active
                                            </div>
                                            <div className="bg-white/5 p-2 px-8 rounded-full border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors shadow-2xl">
                                                <ControlBar
                                                    variation="minimal"
                                                    controls={{ microphone: true, camera: false, screenShare: false, leave: true }}
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
                .lk-button { background-color: rgba(255,255,255,0.05) !important; height: 48px !important; width: 48px !important; border-radius: 50% !important; border: 1px solid rgba(255,255,255,0.1) !important; }
                .lk-button:hover { background-color: rgba(99,102,241,0.5) !important; border-color: rgba(99,102,241,0.5) !important; }
                .lk-button-group { gap: 1rem !important; }
                .lk-disconnect-button { background-color: rgba(220, 38, 38, 0.8) !important; border-color: rgba(220, 38, 38, 0.5) !important; color: white !important; }
                .lk-disconnect-button:hover { background-color: rgba(220, 38, 38, 1) !important; }
                .lk-device-menu { display: none !important; }
                .lk-toast { display: none !important; }
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

export default Studio;