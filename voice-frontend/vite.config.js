import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', 
    strictPort: true,
    port: 5173,
    allowedHosts: ['.elaraby.shop', 'elaraby.shop', 'www.elaraby.shop'],
    hmr: {
        path: '/vite-hmr/', 
        clientPort: 80 
    }
  }
})
