import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const streamProxy = {
  target: process.env.VITE_STREAM_PROXY_TARGET || 'https://spl.camt.cmu.ac.th',
  changeOrigin: true,
  secure: true,
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  server: {
    proxy: {
      '^/parking/': streamProxy,
      '^/parking2/': streamProxy,
      '^/license/': streamProxy,
      '^/license1/': streamProxy,
    },
  },
})
