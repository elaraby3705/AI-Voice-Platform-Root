import { useState, useEffect } from 'react';
import api from '../api/axios'; // Import the pre-configured axios instance
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

export const useLiveKitAuth = () => {
    const { token } = useAuth(); // Get the Django Access Token
    const [roomToken, setRoomToken] = useState(null);
    const [wsUrl, setWsUrl] = useState(null);
    const [error, setError] = useState(null);
    const [isConnecting, setIsConnecting] = useState(true);

    // Capture URL Parameters (Voice & Project)
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
                // RESET STATE IMMEDIATELY
                // This forces the UI to show the loading state and disconnects
                // the previous room before the new token is even fetched.
                setRoomToken(null);
                setIsConnecting(true);
                setError(null);

                // Call Backend Token Endpoint
                // We use 'api' instance which uses the relative baseURL '/api/v1'
                const response = await api.get('/projects/livekit/token/', {
                    headers: { Authorization: `Bearer ${token}` },
                    // Send the selection to Backend
                    // The backend will use these to generate a unique session ID
                    params: {
                        voice: voiceId,   // e.g., 'marcus'
                        project: projectId // e.g., '5'
                    }
                });

                if (isMounted) {
                    // Set the data needed for the Room
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

    }, [token, voiceId, projectId]); // Re-run logic immediately if voice or project changes

    return { roomToken, wsUrl, error, isConnecting };
};
