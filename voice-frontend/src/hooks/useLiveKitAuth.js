import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom'; // <--- 1. New Import

export const useLiveKitAuth = () => {
    const { token } = useAuth(); // Get the Django Access Token
    const [roomToken, setRoomToken] = useState(null);
    const [wsUrl, setWsUrl] = useState(null);
    const [error, setError] = useState(null);
    const [isConnecting, setIsConnecting] = useState(true);

    // 2. Capture URL Parameters (Voice & Project)
    const [searchParams] = useSearchParams();
    const voiceId = searchParams.get('voice') || 'sarah';
    const projectId = searchParams.get('project') || 'default';

    useEffect(() => {
        const connectToLiveKit = async () => {
            if (!token) return;

            try {
                setIsConnecting(true);

                // 3. Call your verified Backend Endpoint
                const API_URL = `http://${window.location.hostname}:8000/api/v1/projects/livekit/token/`;

                const response = await axios.get(API_URL, {
                    headers: { Authorization: `Bearer ${token}` },
                    // 4. Send the selection to Backend
                    params: {
                        voice: voiceId,     // Sends ?voice=marcus
                        project: projectId  // Sends ?project=5
                    }
                });

                // 5. Set the data needed for the Room
                setRoomToken(response.data.token);
                setWsUrl(response.data.url);
                setIsConnecting(false);

            } catch (err) {
                console.error("Failed to connect to Neural Core:", err);
                setError(err);
                setIsConnecting(false);
            }
        };

        connectToLiveKit();
    }, [token, voiceId, projectId]); // <--- Re-run if voice or project changes

    return { roomToken, wsUrl, error, isConnecting };
};