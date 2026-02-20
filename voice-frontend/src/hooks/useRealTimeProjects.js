import { useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

/**
 * 🛰️ CONFIGURATION: 
 * Using window.location.host to dynamically use localhost:5173.
 * Path MUST start with /ws to trigger the Vite Proxy to port 8002.
 */
const WS_DOMAIN = window.location.host; 
const SOCKET_URL = `ws://${WS_DOMAIN}/ws/projects/`; // Added /ws prefix and trailing slash

export const useRealTimeProjects = (onProjectCreated) => {
  const { lastJsonMessage, readyState } = useWebSocket(SOCKET_URL, {
    shouldReconnect: (closeEvent) => true,
    reconnectAttempts: 20, // Increased for better stability in VM
    reconnectInterval: 5000,
    
    // 🔍 Debugging: Monitor why it goes to 'unknown'
    onOpen: () => console.log(`🟢 [WebSocket] Connected via Proxy to: ${SOCKET_URL}`),
    onClose: (event) => console.log("🔴 [WebSocket] Disconnected:", event.code, event.reason),
    onError: (event) => console.error("❌ [WebSocket] Connection Error"),
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
      console.log('📩 [WebSocket] Message Received:', lastJsonMessage);

      if (lastJsonMessage.type === 'PROJECT_CREATED' && onProjectCreated) {
        onProjectCreated(lastJsonMessage.data);
      }
    }
  }, [lastJsonMessage, onProjectCreated]);

  return { connectionStatus };
};
