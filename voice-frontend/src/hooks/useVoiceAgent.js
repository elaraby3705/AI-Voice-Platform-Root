import { useState, useCallback } from 'react';
import api from '../api/axios'; // Imports your configured axios instance

export const useVoiceAgent = () => {
    // 1. Define State to track connection status
    const [state, setState] = useState({
        token: null,
        url: null,
        isConnected: false,
        isConnecting: false,
        error: null,
    });

    // 2. Function: Request a Ticket from Django
    const connectToAgent = useCallback(async () => {
        // Reset state before starting
        setState(prev => ({ ...prev, isConnecting: true, error: null }));

        try {
            console.log("📡 Requesting LiveKit Token from Django...");

            // This calls: http://192.168.100.30:8000/api/v1/livekit/token/
            // The 'api' instance automatically adds your Auth Token header!
            const response = await api.get('/livekit/token/');

            console.log("✅ Token Received:", response.data);

            const { token, url } = response.data;

            // Update State -> This will trigger the UI to show the LiveKit Room
            setState({
                token,
                url,
                isConnected: true,
                isConnecting: false,
                error: null,
            });

        } catch (err) {
            console.error("❌ Connection Failed:", err);

            let errorMessage = "Failed to connect to AI Agent.";

            // Handle specific errors based on the response
            if (err.response) {
                if (err.response.status === 401) errorMessage = "Please login to access the demo.";
                if (err.response.status === 404) errorMessage = "Agent endpoint not found. Check Backend URL.";
                if (err.response.status === 500) errorMessage = "Server error. Is the Docker Container running?";
            } else if (err.request) {
                errorMessage = "No response from server. Check your VM Network/VPN.";
            }

            setState(prev => ({
                ...prev,
                isConnecting: false,
                error: errorMessage,
            }));
        }
    }, []);

    // 3. Function: Disconnect / Hang Up
    const disconnect = useCallback(() => {
        console.log("🔌 Disconnecting...");
        setState({
            token: null,
            url: null,
            isConnected: false,
            isConnecting: false,
            error: null,
        });
    }, []);

    // Return everything the UI needs
    return { ...state, connectToAgent, disconnect };
};