/**
 * 🔌 Real-Time Projects Hook (Production Ready)
 * -------------------------------------------
 * This hook establishes a WebSocket connection via the Vite Proxy.
 * It ensures stability when running in Docker/VM environments by 
 * tunneling through the frontend port (5173) to the real-time API (8002).
 */

import { useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

/**
 * 🛠️ CONFIGURATION:
 * We use window.location.host to capture the current frontend domain/port (e.g., localhost:5173).
 * The path '/ws' is intercepted by the Vite proxy configured in vite.config.js.
 */
const WS_DOMAIN = window.location.host; 
const SOCKET_URL = `ws://${WS_DOMAIN}/ws/projects/`;

export const useRealTimeProjects = (onProjectCreated) => {
  const { lastJsonMessage, readyState } = useWebSocket(SOCKET_URL, {
    /** 🔄 RECONNECTION LOGIC:
     * Ensures the client automatically recovers if the backend container restarts.
     */
    shouldReconnect: (closeEvent) => true,
    reconnectAttempts: 20,
    reconnectInterval: 5000,
    
    /** 📡 EVENT HANDLERS:
     * Used for real-time monitoring and debugging in the developer console.
     */
    onOpen: () => console.log(`🟢 [WebSocket] Tunnel Established via Proxy: ${SOCKET_URL}`),
    onClose: (event) => console.log("🔴 [WebSocket] Connection Terminated:", event.code, event.reason),
    onError: (event) => console.error(`❌ [WebSocket] Handshake Failed at ${SOCKET_URL}`),
  });

  /** 📊 CONNECTION STATUS MAP:
   * Maps numerical readyStates to human-readable strings for the Dashboard UI.
   */
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  /** 📥 MESSAGE PROCESSING:
   * Listens for incoming JSON frames and triggers callbacks for the UI.
   */
  useEffect(() => {
    if (lastJsonMessage !== null) {
      console.log('📩 [WebSocket] Frame Received:', lastJsonMessage);

      // Validate event type and trigger the update callback
      if (lastJsonMessage.type === 'PROJECT_CREATED' && onProjectCreated) {
        onProjectCreated(lastJsonMessage.data);
      }
    }
  }, [lastJsonMessage, onProjectCreated]);

  return { connectionStatus };
};
