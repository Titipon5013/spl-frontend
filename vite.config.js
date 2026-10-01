import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const backendProxy = {
  target: process.env.VITE_BACKEND_PROXY_TARGET || 'http://127.0.0.1:8000',
  changeOrigin: true,
  secure: true,
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
  server: {
    proxy: {
      '^/api/': backendProxy,
      '^/parking/': backendProxy,
      '^/parking2/': backendProxy,
      '^/license/': backendProxy,
      '^/license1/': backendProxy,
    },
  },
})
