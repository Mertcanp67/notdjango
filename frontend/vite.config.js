import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // '/api' ile başlayan tüm istekleri backend sunucusuna yönlendir.
      '/api': {
        target: 'http://127.0.0.1:8000', // Django backend sunucunuzun adresi
        changeOrigin: true, // CORS hatalarını önlemek için gereklidir
      }
    }
  }
})