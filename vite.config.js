import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/appsuite-proxy': {
        target: 'https://us.appsuite.cloud',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/appsuite-proxy/, '')
      }
    }
  }
})
