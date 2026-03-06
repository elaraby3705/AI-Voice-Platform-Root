import { useEffect } from 'react';
import * as WebSocketModule from 'react-use-websocket';

const useWebSocket = WebSocketModule.default?.useWebSocket || WebSocketModule.useWebSocket || WebSocketModule.default;
const { ReadyState } = WebSocketModule;

const SOCKET_URL = `ws://${window.location.host}/ws/projects/`;

export const useRealTimeProjects = (onProjectCreated) => {

    if (typeof useWebSocket !== 'function') {
        console.error("CRITICAL: useWebSocket is not a function. Check your import.");
        return { connectionStatus: 'Error' };
    }

    const { lastJsonMessage, readyState } = useWebSocket(SOCKET_URL, {
        shouldReconnect: () => true,
        reconnectAttempts: 20,
        reconnectInterval: 5000,
    });
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
    return { connectionStatus: readyState }; 
};
