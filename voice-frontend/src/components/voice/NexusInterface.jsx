import React, { useState, useEffect } from 'react';
import {
    LiveKitRoom,
    RoomAudioRenderer,
    useLocalParticipant,
    useConnectionState,
    ConnectionState
} from '@livekit/components-react';
import '@livekit/components-styles';
import { useNexusToken } from '../../hooks/useNexusToken';
import NexusOrb from './NexusOrb';
import { Mic, MicOff, PhoneOff, X, Loader2, Settings2, Signal } from 'lucide-react';

/**
 * SessionContent - The internal logic that runs ONLY when connected.
 * Handles Mute toggles, Connection Status, and the Orb.
 */
const SessionContent = ({ onClose }) => {
    const { localParticipant } = useLocalParticipant();
    const connectionState = useConnectionState();
    const [isMuted, setIsMuted] = useState(false);

    // Sync local state with actual LiveKit participant state
    useEffect(() => {
        if (localParticipant) {
            setIsMuted(localParticipant.isMicrophoneEnabled === false);
        }
    }, [localParticipant]);

    const toggleMute = async () => {
        if (localParticipant) {
            const newState = !isMuted;
            await localParticipant.setMicrophoneEnabled(!newState);
            setIsMuted(newState);
        }
    };

    // Determine the Orb state based on actual connection status
    const getOrbState = () => {
        if (connectionState === ConnectionState.Connecting) return 'connecting';
        if (connectionState === ConnectionState.Connected) return 'connected';
        return 'disconnected';
    };

    return (
        <div className="flex flex-col items-center justify-between h-full w-full py-12 relative z-10">
            {/* 1. Header: Signal Status */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <div className={`w-2 h-2 rounded-full ${connectionState === ConnectionState.Connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-xs font-mono text-slate-400 tracking-widest uppercase">
                    {connectionState === ConnectionState.Connected ? 'Signal: Strong' : 'Establishing Uplink...'}
                </span>
                <Signal className="w-3 h-3 text-slate-500 ml-2" />
            </div>

            {/* 2. The Core: Nexus Orb */}
            <div className="flex-1 flex flex-col items-center justify-center w-full">
                <div className="scale-125 mb-8">
                    <NexusOrb state={getOrbState()} />
                </div>

                {/* Status Text */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-light text-white tracking-wider">Nexus AI</h2>
                    <p className="text-indigo-300/60 text-sm font-mono animate-pulse">
                        {isMuted ? '[ MICROPHONE MUTED ]' : '[ LISTENING ]'}
                    </p>
                </div>
            </div>

            {/* 3. Control Deck (Buttons) */}
            <div className="flex items-center gap-6">
                <button className="p-4 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                    <Settings2 className="w-6 h-6" />
                </button>

                <button
                    onClick={toggleMute}
                    className={`p-5 rounded-full border transition-all duration-300 shadow-lg ${
                        isMuted
                        ? 'bg-rose-500/10 border-rose-500/50 text-rose-500 hover:bg-rose-500/20'
                        : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 hover:shadow-indigo-500/25 hover:-translate-y-1'
                    }`}
                >
                    {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </button>

                <button
                    onClick={onClose}
                    className="p-5 rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-500 hover:scale-105 transition-all duration-300 group"
                >
                    <PhoneOff className="w-7 h-7 group-hover:animate-shake" />
                </button>
            </div>
        </div>
    );
};

/**
 * NexusInterface - The Outer Container (Modal & Logic)
 */
const NexusInterface = ({ isOpen, onClose }) => {
    // Fetch Token
    const { token, loading, error } = useNexusToken(isOpen);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* A. Backdrop (Blur & Darken) */}
            <div
                className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl transition-opacity duration-500"
                onClick={onClose} // Click outside to close (optional)
            />

            {/* B. Main Modal Container */}
            <div className="relative w-full max-w-4xl h-[85vh] flex flex-col items-center justify-center">

                {/* Close Button (Top Right) */}
                <button
                    onClick={onClose}
                    className="absolute top-0 right-4 z-50 p-2 text-slate-500 hover:text-white transition-colors"
                >
                    <X className="w-8 h-8" />
                </button>

                {/* C. State Handling */}
                {loading && (
                    <div className="flex flex-col items-center gap-4 text-indigo-400 z-50">
                        <Loader2 className="w-16 h-16 animate-spin opacity-50" />
                        <span className="text-sm font-mono tracking-[0.3em] animate-pulse">AUTHENTICATING...</span>
                    </div>
                )}

                {error && (
                    <div className="z-50 bg-rose-950/50 border border-rose-500/30 p-8 rounded-2xl text-center backdrop-blur-md max-w-md">
                        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                            <PhoneOff className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl text-white font-semibold mb-2">Connection Terminated</h3>
                        <p className="text-rose-200/60 mb-6">{error}</p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors"
                        >
                            Return to Base
                        </button>
                    </div>
                )}

                {/* D. LiveKit Room (Only renders when token is ready) */}
                {!loading && !error && token && (
                    <LiveKitRoom
                        token={token}
                        serverUrl={import.meta.env.VITE_LIVEKIT_URL || "wss://aivoice-ywhajgoz.livekit.cloud"}
                        connect={true}
                        audio={true}
                        video={false}
                        onDisconnected={onClose}
                        className="w-full h-full"
                    >
                        {/* 1. Invisible Audio Renderer (Crucial!) */}
                        <RoomAudioRenderer />

                        {/* 2. The Internal Content */}
                        <SessionContent onClose={onClose} />
                    </LiveKitRoom>
                )}
            </div>
        </div>
    );
};

export default NexusInterface;