import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

export const useNexusToken = (isOpen, voiceId = 'sarah', projectId = 'default') => {
    // 1. State Management
    const [token, setToken] = useState(null);
    const [serverUrl, setServerUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 2. Safety Check (To prevent memory leaks if component unmounts)
    const isMounted = useRef(true);

    useEffect(() => {
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        // Reset state when the modal/window is closed
        if (!isOpen) {
            setToken(null);
            setServerUrl(null);
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        const fetchToken = async () => {
            setLoading(true);
            setError(null);

            try {
                console.log(`🔐 Nexus: Requesting secure link for [Voice: ${voiceId}]...`);

                // 3. API Call to Django Backend
                const response = await api.get('/projects/livekit/token/', {
                    params: { voice: voiceId, project: projectId },
                    signal: controller.signal
                });

                if (isMounted.current) {
                    const data = response.data;

                    if (data.token && data.url) {
                        console.log("✅ Nexus Connected!");
                        console.log(`   🔗 Connecting to: ${data.url}`);
                        console.log(`   📂 Project: ${data.project?.name || 'Unknown'} (ID: ${data.project?.id})`);

                        // 4. Update State with Token AND URL
                        setToken(data.token);
                        setServerUrl(data.url);
                    } else {
                        throw new Error("Token or Server URL missing in response");
                    }
                }

            } catch (err) {
                if (err.name === 'CanceledError') return; // Ignore aborts

                console.error("❌ Nexus Connection Error:", err.response?.data || err.message);

                if (isMounted.current) {
                    const msg = err.response?.status === 401
                        ? "Session Expired. Please Login again."
                        : "Connection Failed. Could not reach Voice Server.";
                    setError(msg);
                }
            } finally {
                if (isMounted.current) setLoading(false);
            }
        };

        fetchToken();

        return () => controller.abort(); // Cleanup on change
    }, [isOpen, voiceId, projectId]);

    // 5. Return everything needed by the UI
    return { token, serverUrl, loading, error };
};