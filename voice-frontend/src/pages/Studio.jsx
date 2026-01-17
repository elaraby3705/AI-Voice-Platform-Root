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
    const [searchParams, setSearchParams]