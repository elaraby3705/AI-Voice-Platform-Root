import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export const useLiveKitAuth = () => {
    const { token } = useAuth(); // Get the Django Access Token
    const [roomToken, setRoomToken] = useState(null);
    const [wsUrl, setWsUrl] = useState(null);
    const [error, setError] = useState(null);
    const [isConnecting, setIsConnecting] = useState(true);

    useEffect(() => {
        const connectToLiveKit = async () => {
            if (!token) return;

            try {
                setIsConnecting(true);
                // 1. Call your verified Backend Endpoint
                // Make sure this matches your actual IP and Port
                const API_URL = `http://${window.location.hostname}:8000/api/v1/projects/livekit/token/`;

                const response = await axios.get(API_URL, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // 2. Set the data needed for the Room
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
    }, [token]);

    return { roomToken, wsUrl, error, isConnecting };
};