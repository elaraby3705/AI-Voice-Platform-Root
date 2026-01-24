import { useState, useEffect, useRef } from 'react';
import api from '../api/axios'; // Ensure this points to your configured Axios instance

/**
 * useNexusToken - Advanced Hook for LiveKit Authentication
 * * @param {boolean} isOpen - Only fetch when the UI modal is actually open (Performance)
 * @param {string} voiceId - The selected AI voice persona (default: 'sarah')
 * @param {string} projectId - The active project context (default: 'default')
 * * Features:
 * 1. AbortController: Cancels stale requests if the user closes the modal quickly.
 * 2. Auto-Reset: Cleans up sensitive tokens from memory when the modal closes.
 * 3. Error Classification: Distinguishes between Auth errors and Network errors.
 */
export const useNexusToken = (isOpen, voiceId = 'sarah', projectId = 'default') => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Ref to track if the component is mounted (prevents state updates on unmount)
    const isMounted = useRef(true);

    useEffect(() => {
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        // 1. If modal is closed, clean up state and do nothing.
        if (!isOpen) {
            setToken(null);
            setError(null);
            setLoading(false);
            return;
        }

        // 2. Setup AbortController to cancel request if dependencies change rapidly
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchToken = async () => {
            setLoading(true);
            setError(null);

            try {
                console.log(`🔐 Nexus: Requesting secure link for voice [${voiceId}]...`);

                // 3. API Call to Django Backend
                const response = await api.get('/projects/livekit/token/', {
                    params: {
                        voice: voiceId,
                        project: projectId
                    },
                    signal: signal // Attach signal to axios
                });

                if (isMounted.current) {
                    // 4. Success: Store the JWT
                    const receivedToken = response.data.token;
                    if (!receivedToken) throw new Error("Backend returned empty token");

                    setToken(receivedToken);
                    console.log("✅ Nexus: Link established.");
                }

            } catch (err) {
                // Ignore errors caused by cancelling the request (user closed modal)
                if (err.name === 'CanceledError' || err.code === "ERR_CANCELED") {
                    console.log("⚠️ Nexus: Connection aborted by user.");
                    return;
                }

                if (isMounted.current) {
                    console.error("❌ Nexus: Handshake Failed", err);

                    // 5. Advanced Error Parsing for UI
                    let errorMessage = "Connection failed";
                    if (err.response) {
                        // Server responded with 4xx/5xx
                        if (err.response.status === 401) errorMessage = "Unauthorized: Please login again.";
                        else if (err.response.status === 403) errorMessage = "Access Denied: Insufficient permissions.";
                        else errorMessage = err.response.data?.detail || "Server refused connection.";
                    } else if (err.request) {
                        // Request sent but no response
                        errorMessage = "Network Error: Could not reach Nexus Core.";
                    }

                    setError(errorMessage);
                }
            } finally {
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        fetchToken();

        // 6. Cleanup Function: Cancel any in-flight request if dependencies change
        return () => {
            controller.abort();
        };

    }, [isOpen, voiceId, projectId]);

    return { token, loading, error };
};