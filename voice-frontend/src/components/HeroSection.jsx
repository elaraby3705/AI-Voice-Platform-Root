import React from 'react';
import { LiveKitRoom, AudioConference } from '@livekit/components-react';
import '@livekit/components-styles'; // Critical for audio to work!
import { useVoiceAgent } from '../hooks/useVoiceAgent';

const HeroSection = () => {
    // Initialize the Hook
    const { token, url, isConnected, isConnecting, error, connectToAgent, disconnect } = useVoiceAgent();

    // 🔴 ACTIVE CALL VIEW (Overlay)
    if (isConnected && token && url) {
        return (
            <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center">
                <LiveKitRoom
                    video={false}
                    audio={true}
                    token={token}
                    serverUrl={url}
                    connect={true}
                    data-lk-theme="default"
                >
                    {/* The Invisible Audio Logic */}
                    <AudioConference />

                    {/* Visual UI for the Call */}
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-4 animate-pulse">
                            🎙️ Connected to Project Nexus
                        </div>
                        <p className="text-gray-400 mb-8">Go ahead, say something...</p>

                        <button
                            onClick={disconnect}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-all"
                        >
                            End Session
                        </button>
                    </div>
                </LiveKitRoom>
            </div>
        );
    }

    // 🟢 NORMAL VIEW
    return (
        <div className="hero-section">
            {/* ... Your existing Titles ... */}

            {/* Error Message Toast */}
            {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded mb-4 inline-block">
                    ⚠️ {error}
                </div>
            )}

            <div className="flex gap-4 justify-center">
                <button className="btn-secondary">Get API Keys</button>

                <button
                    onClick={() => { alert("BUTTON CLICKED!"); connectToAgent(); }}
                    disabled={isConnecting}
                    className="btn-primary flex items-center gap-2"
                >
                    {isConnecting ? (
                        <span>🔄 Connecting...</span>
                    ) : (
                        <span>▶ Listen to Demo</span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default HeroSection;