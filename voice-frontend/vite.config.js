import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    strictPort: true,
    port: 5173,
    watch: {
      usePolling: true,
      interval: 100,
    },
    // 👇 NEW: This section bridges the gap for WebSockets
    proxy: {
      '/ws': {
        target: 'ws://127.0.0.1:8002', // The real-time-api port
        ws: true,                     // Enable WebSocket proxying
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ws/, '')
      }
    }
  }
})