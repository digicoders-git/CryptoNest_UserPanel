import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    https: false,
    host: true,
    port: 5173,
    cors: true,
    headers: {
      'Content-Security-Policy': "connect-src 'self' http://localhost:5000 https: wss:"
    }
  },
  preview: {
    host: true,
    port: 4173,
    cors: true
  },
  define: {
    global: 'globalThis'
  },
  optimizeDeps: {
    include: ['@reown/appkit', '@reown/appkit-adapter-wagmi', 'viem', 'wagmi']
  }
})
