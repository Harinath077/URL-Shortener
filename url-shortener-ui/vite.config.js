import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any /api/* request is forwarded to Spring Boot — browser sees no CORS
      // e.g. /api/shorten → http://localhost:8080/api/shorten
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
