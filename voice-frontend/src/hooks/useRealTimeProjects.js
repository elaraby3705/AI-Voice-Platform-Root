import { useEffect, useMemo } from 'react';
import * as WebSocketModule from 'react-use-websocket';

/**
 * 📡 THE BRIDGE: Real-time Connection via Nginx Gateway
 * This hook manages the WebSocket connection to the Real-time API
 * tunnelled through the Nginx Gateway.
 */
const SOCKET_URL = `ws://${window.location.host}/ws/projects/`;

// Securely extract the hook and ReadyState to handle Vite's ESM bundling
const useWebSocket = WebSocketModule.useWebSocket || WebSocketModule.default?.useWebSocket || WebSocketModule.default;
const { ReadyState } = WebSocketModule;

export const useRealTimeProjects = (onProjectCreated) => {
  // Validate that the library was imported and resolved as a function
  const isLibraryReady = typeof useWebSocket === 'function';

  // Establish the WebSocket connection
  const { lastJsonMessage, readyState } = isLibraryReady 
    ? useWebSocket(SOCKET_URL, {
        shouldReconnect: () => true,
        reconnectAttempts: 20,
        reconnectInterval: 5000,
        onOpen: () => console.log("🟢 [SYSTEM] Tunnel established via Nginx Gateway!"),
        onClose: () => console.log("🔴 [SYSTEM] Tunnel closed. Retrying..."),
        onError: (err) => console.error("❌ [SYSTEM] Connection failed at:", SOCKET_URL)
      })
    : { lastJsonMessage: null, readyState: null };

  // Map readyState to descriptive strings for UI display
  const connectionStatus = useMemo(() => {
    if (!isLibraryReady) return 'Library Load Error';
    
    const states = {
      [ReadyState.CONNECTING]: 'Connecting',
      [ReadyState.OPEN]: 'Open',
      [ReadyState.CLOSING]: 'Closing',
      [ReadyState.CLOSED]: 'Closed',
      [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    };
    return states[readyState] || 'Unknown';
  }, [readyState, isLibraryReady]);

  // Listener for incoming messages from Redis/Real-time API
  useEffect(() => {
    if (lastJsonMessage !== null && typeof lastJsonMessage === 'object') {
      console.log('📩 [DATA] Message received from Redis/Real-time API:', lastJsonMessage);
      
      // Handle project creation events
      if (lastJsonMessage.type === 'PROJECT_CREATED' && onProjectCreated) {
        onProjectCreated(lastJsonMessage.data);
      }
    }
  }, [lastJsonMessage, onProjectCreated]);

  return { connectionStatus };
};
