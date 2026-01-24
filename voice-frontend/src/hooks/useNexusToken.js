import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

export const useNexusToken = (isOpen, voiceId = 'sarah', projectId = 'default') => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isMounted = useRef(true);

    useEffect(() => {
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setToken(null);
            setError(null);
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        const fetchToken = async () => {
            setLoading(true);
            setError(null);

            try {
                console.log(`🔐 Nexus: Requesting link for [Voice: ${voiceId}, Project: ${projectId}]...`);

                const response = await api.get('/projects/livekit/token/', {
                    params: { voice: voiceId, project: projectId },
                    signal: controller.signal
                });

                if (isMounted.current) {
                    const data = response.data;

                    if (data.token) {
                        console.log("✅ Nexus Connected!");
                        console.log(`   📂 Project: ${data.project?.title || 'Unknown'} (ID: ${data.project?.id})`);
                        console.log(`   🏠 Room: ${data.room_name}`);

                        setToken(data.token);
                    } else {
                        throw new Error("Token missing in response");
                    }
                }

            } catch (err) {
                if (err.name === 'CanceledError') return;

                console.error("❌ Nexus Error:", err.response?.data || err.message);

                if (isMounted.current) {
                    const msg = err.response?.status === 401
                        ? "Session Expired. Please Login."
                        : "Connection Failed. Check Server.";
                    setError(msg);
                }
            } finally {
                if (isMounted.current) setLoading(false);
            }
        };

        fetchToken();

        return () => controller.abort();
    }, [isOpen, voiceId, projectId]);

    return { token, loading, error };
};