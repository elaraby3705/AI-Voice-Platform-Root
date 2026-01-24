import React, { useMemo } from 'react';
import { useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { BarVisualizer } from '@livekit/components-react';

/**
 * NexusOrb - The Visual Persona of the AI
 * @param {string} state - The current connection status ('connecting' | 'connected' | 'disconnected' | 'error')
 */
const NexusOrb = ({ state }) => {
    // 1. Capture the local Microphone track to visualize User Speech
    // (This gives the user immediate visual feedback that "I am being heard")
    const audioTracks = useTracks([Track.Source.Microphone]);
    const micTrack = audioTracks[0];

    // 2. Dynamic Styling Engine based on State
    const orbStyle = useMemo(() => {
        switch (state) {
            case 'connecting':
                return {
                    glow: 'bg-amber-500/20',
                    border: 'border-amber-500/30',
                    pulse: 'animate-pulse',
                    scale: 'scale-90',
                    visualizerColor: '#fbbf24' // Amber-400
                };
            case 'connected':
                return {
                    glow: 'bg-indigo-500/30',
                    border: 'border-indigo-400/20',
                    pulse: '', // No fixed pulse, the visualizer handles movement
                    scale: 'scale-100',
                    visualizerColor: '#818cf8' // Indigo-400
                };
            case 'error':
                return {
                    glow: 'bg-rose-600/20',
                    border: 'border-rose-500/40',
                    pulse: 'animate-bounce', // Agitated movement
                    scale: 'scale-95',
                    visualizerColor: '#f43f5e' // Rose-500
                };
            default: // disconnected
                return {
                    glow: 'bg-slate-500/10',
                    border: 'border-slate-600/10',
                    pulse: '',
                    scale: 'scale-75 grayscale',
                    visualizerColor: '#475569'
                };
        }
    }, [state]);

    return (
        <div className={`relative flex items-center justify-center w-96 h-96 transition-all duration-1000 ease-out ${orbStyle.scale}`}>

            {/* LAYER 1: The Ambient Glow (Aura) */}
            {/* Large blur radius creates the "Atmosphere" around the AI */}
            <div className={`absolute inset-0 rounded-full blur-[100px] transition-colors duration-700 ${orbStyle.glow}`} />

            {/* LAYER 2: The Core Containment Field (Glass Sphere) */}
            <div className={`relative w-64 h-64 rounded-full flex items-center justify-center overflow-hidden
                backdrop-blur-3xl bg-black/40
                border ${orbStyle.border}
                shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)]
                transition-all duration-700
                ${orbStyle.pulse}
            `}>

                {/* LAYER 3: Inner Reflection (Top Highlight) */}
                {/* Gives the sphere volume and 3D appearance */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                {/* LAYER 4: The Neural Visualizer */}
                {/* Only renders if we have a track, otherwise shows a "Waiting" breather */}
                <div className="flex items-center justify-center h-32 w-full opacity-90 mix-blend-screen z-10">
                    {state === 'connected' && micTrack ? (
                        <BarVisualizer
                            state={state}
                            barCount={7}
                            trackRef={micTrack}
                            className="h-full w-48"
                            options={{
                                color: orbStyle.visualizerColor,
                                minHeight: 20,
                                shadowColor: orbStyle.visualizerColor
                            }}
                        />
                    ) : (
                        // Fallback "Breathing" Core when no audio or connecting
                        <div className={`w-32 h-1 rounded-full ${orbStyle.glow.replace('/20', '/80')} animate-ping duration-[3000ms]`} />
                    )}
                </div>

                {/* LAYER 5: Bottom Refraction (Subtle Detail) */}
                <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

            </div>

            {/* LAYER 6: Orbital Rings (Cosmetic - Optional Tech Feel) */}
            {state === 'connected' && (
                <>
                    <div className="absolute inset-4 rounded-full border border-indigo-500/10 animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-12 rounded-full border border-white/5 animate-[spin_15s_linear_infinite_reverse]" />
                </>
            )}

        </div>
    );
};

export default NexusOrb;