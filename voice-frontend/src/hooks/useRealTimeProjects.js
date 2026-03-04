import { useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

/**
 * 📡 THE BRIDGE FIX:
 * We connect to the FRONTEND port (5173) but via the '/ws/' path.
 * This triggers the Vite Proxy to securely tunnel the data to port 8002.
 */
const WS_DOMAIN = window.location.host; // This is 'localhost:5173'
const SOCKET_URL = `ws://${WS_DOMAIN}/ws/projects/`; // 👈 MUST start with /ws/

export const useRealTimeProjects = (onProjectCreated) => {
  const { lastJsonMessage, readyState } = useWebSocket(SOCKET_URL, {
    shouldReconnect: () => true,
    reconnectAttempts: 20,
    reconnectInterval: 5000,
    
    // Debugging Console - Watch for the "🟢"
    onOpen: () => console.log("🟢 [SYSTEM] Tunnel established via Vite Proxy!"),
    onClose: () => console.log("🔴 [SYSTEM] Tunnel closed. Retrying..."),
    onError: (err) => console.error("❌ [SYSTEM] Connection failed at:", SOCKET_URL)
  });

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  useEffect(() => {
    if (lastJsonMessage !== null) {
      console.log('📩 [DATA] Message received from Redis:', lastJsonMessage);
      if (lastJsonMessage.type === 'PROJECT_CREATED' && onProjectCreated) {
        onProjectCreated(lastJsonMessage.data);
      }
    }
  }, [lastJsonMessage, onProjectCreated]);

  return { connectionStatus };
};
