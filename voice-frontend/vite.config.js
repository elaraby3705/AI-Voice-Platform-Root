import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', 
    strictPort: true,
    port: 5173,
    hmr: {
        // We tell Vite to look for HMR signals on the same path
        path: '/ws' 
    }
  }
})
