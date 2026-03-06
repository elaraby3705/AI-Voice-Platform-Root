import { useEffect, useMemo } from 'react';
import * as WebSocketModule from 'react-use-websocket';

/**
 * 📡 THE BRIDGE: Real-time Connection via Nginx Gateway
 * This hook manages the WebSocket connection to the Real-time API
 * tunnelled through the Nginx Gateway.
 */
const SOCKET_URL = `ws://${window.location.host}/ws/projects/`;

// Extract function and ReadyState safely for Vite environment
const useWebSocket = WebSocketModule.default?.useWebSocket || WebSocketModule.useWebSocket || WebSocketModule.default;
const { ReadyState } = WebSocketModule;

export const useRealTimeProjects = (onProjectCreated) => {
  // Validate if the library was imported successfully
  if (typeof useWebSocket !== 'function') {
    console.error("CRITICAL: useWebSocket is not a function. Check your import.");
    return { connectionStatus: 'Error' };
  }

  // Establish connection
  const { lastJsonMessage, readyState } = useWebSocket(SOCKET_URL, {
    shouldReconnect: () => true,
    reconnectAttempts: 20,
    reconnectInterval: 5000,
    onOpen: () => console.log("🟢 [SYSTEM] Tunnel established via Nginx Gateway!"),
    onClose: () => console.log("🔴 [SYSTEM] Tunnel closed. Retrying..."),
    onError: (err) => console.error("❌ [SYSTEM] Connection failed at:", SOCKET_URL)
  });

  // Map readyState to descriptive strings
  const connectionStatus = useMemo(() => {
    const states = {
      [ReadyState.CONNECTING]: 'Connecting',
      [ReadyState.OPEN]: 'Open',
      [ReadyState.CLOSING]: 'Closing',
      [ReadyState.CLOSED]: 'Closed',
      [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    };
    return states[readyState] || 'Unknown';
  }, [readyState]);

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
