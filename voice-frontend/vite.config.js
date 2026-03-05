import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Essential for Docker networking
    strictPort: true,
    port: 5173,
    watch: {
      usePolling: true,
      interval: 100,
    },
    // Proxy logic removed: Nginx acts as the central gateway
  }
})
