import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In local dev, /api calls go to the Express server (npm run dev:api)
    proxy: { '/api': 'http://localhost:3001' },
  },
})
