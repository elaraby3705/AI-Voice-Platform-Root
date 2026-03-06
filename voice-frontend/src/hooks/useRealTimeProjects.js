import { useEffect } from 'react';
const ReactUseWebSocket = require('react-use-websocket');
const useWebSocket = ReactUseWebSocket.default.useWebSocket || ReactUseWebSocket.useWebSocket || ReactUseWebSocket.default;
const ReadyState = ReactUseWebSocket.ReadyState;

/**
 * 📡 THE BRIDGE: Real-time Connection via Nginx Gateway
 * This hook connects directly to the Nginx Gateway (Port 80)
 * Nginx will tunnel this WebSocket connection to the Real-time API (Port 8002)
 */
const SOCKET_URL = `ws://${window.location.host}/ws/projects/`; 

export const useRealTimeProjects = (onProjectCreated) => {
  // Establishing connection via the Nginx reverse proxy
  const { lastJsonMessage, readyState } = useWebSocket(SOCKET_URL, {
    shouldReconnect: () => true,
    reconnectAttempts: 20,
    reconnectInterval: 5000,
    
    // Debugging connection states
    onOpen: () => console.log("🟢 [SYSTEM] Tunnel established via Nginx Gateway!"),
    onClose: () => console.log("🔴 [SYSTEM] Tunnel closed. Retrying..."),
    onError: (err) => console.error("❌ [SYSTEM] Connection failed at:", SOCKET_URL)
  });

  // Map WebSocket states to readable strings
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  // Listener for incoming data (e.g., new project notifications)
  useEffect(() => {
    if (lastJsonMessage !== null) {
      console.log('📩 [DATA] Message received from Redis/Real-time API:', lastJsonMessage);
      
      // Handle project creation events
      if (lastJsonMessage.type === 'PROJECT_CREATED' && onProjectCreated) {
        onProjectCreated(lastJsonMessage.data);
      }
    }
  }, [lastJsonMessage, onProjectCreated]);

  return { connectionStatus };
};
