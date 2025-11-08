// vite.config.js (en la raíz de tu frontend)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // O tu puerto de frontend
    proxy: {
      // Esto redirige /api -> http://localhost:5000
      '/api': {
        target: 'http://localhost:5000', // El puerto de tu BACKEND
        changeOrigin: true,
      }
    }
  }
})