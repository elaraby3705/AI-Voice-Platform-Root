/**
 * 🔌 Real-Time Projects Hook
 * ---------------------------
 * This hook connects to the Backend WebSocket to receive live updates.
 *
 * 📦 DEPENDENCY REQUIRED:
 * You must install 'react-use-websocket' inside the container:
 * $ docker exec -it nexus_frontend npm install react-use-websocket
 *
 * 🧪 HOW TO TEST:
 * 1. Open the Dashboard in your browser.
 * 2. Open a separate tab (Incognito) or use Django Admin.
 * 3. Create a new project.
 * 4. You should see a Toast/Alert instantly on the Dashboard without refreshing.
 */

import { useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

// 🛑 The Magic Fix: Automatically extract the IP or domain from the browser
const WS_DOMAIN = window.location.hostname; 

// This dynamically adapts whether you are using localhost or a local network IP (e.g., 192.168.x.x)
const SOCKET_URL = `ws://${WS_DOMAIN}:8002/ws/projects`;

export const useRealTimeProjects = (onProjectCreated) => {
  const { lastJsonMessage, readyState } = useWebSocket(SOCKET_URL, {
    shouldReconnect: (closeEvent) => true, // Auto-reconnect if server restarts
    reconnectAttempts: 10,
    reconnectInterval: 3000,
    
    // 👇 Tracking Radar (for visual debugging in the browser's F12 Console)
    onOpen: () => console.log(`🟢 [WebSocket] Connected to ${SOCKET_URL} Successfully!`),
    onClose: (event) => console.log("🔴 [WebSocket] Disconnected:", event.code, event.reason),
    onError: (event) => console.error(`❌ [WebSocket] Error! Cannot connect to ${SOCKET_URL}`),
  });

  // Debugging Connection Status
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

      // Check if the message is about a new project
      if (lastJsonMessage.type === 'PROJECT_CREATED' && onProjectCreated) {
        onProjectCreated(lastJsonMessage.data);
      }
    }
  }, [lastJsonMessage, onProjectCreated]);

  return { connectionStatus };
};
