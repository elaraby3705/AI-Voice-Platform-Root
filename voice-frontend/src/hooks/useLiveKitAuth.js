import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

export const useLiveKitAuth = () => {
    const { token } = useAuth(); // Get the Django Access Token
    const [roomToken, setRoomToken] = useState(null);
    const [wsUrl, setWsUrl] = useState(null);
    const [error, setError] = useState(null);
    const [isConnecting, setIsConnecting] = useState(true);

    // 1. Capture URL Parameters (Voice & Project)
    // These drive the session configuration.
    const [searchParams] = useSearchParams();
    const voiceId = searchParams.get('voice') || 'sarah';
    const projectId = searchParams.get('project') || 'default';

    useEffect(() => {
        // Flag to prevent state updates if component unmounts
        let isMounted = true;

        const connectToLiveKit = async () => {
            if (!token) return;

            try {
                // 2. RESET STATE IMMEDIATELY
                // This forces the UI to show the loading state and disconnects
                // the previous room before the new token is even fetched.
                setRoomToken(null);
                setIsConnecting(true);
                setError(null);

                // 3. Call Backend Token Endpoint
                const API_URL = `http://${window.location.hostname}:8000/api/v1/projects/livekit/token/`;

                const response = await axios.get(API_URL, {
                    headers: { Authorization: `Bearer ${token}` },
                    // 4. Send the selection to Backend
                    // The backend will use these to generate a unique session ID
                    params: {
                        voice: voiceId,     // e.g., 'marcus'
                        project: projectId  // e.g., '5'
                    }
                });

                if (isMounted) {
                    // 5. Set the data needed for the Room
                    setRoomToken(response.data.token);
                    setWsUrl(response.data.url);
                    setIsConnecting(false);
                }

            } catch (err) {
                console.error("Failed to connect to Neural Core:", err);
                if (isMounted) {
                    setError(err);
                    setIsConnecting(false);
                }
            }
        };

        connectToLiveKit();

        // Cleanup
        return () => { isMounted = false; };

    }, [token, voiceId, projectId]); // <--- Re-run logic immediately if voice or project changes

    return { roomToken, wsUrl, error, isConnecting };
};