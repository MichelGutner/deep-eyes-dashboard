import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-is']
  },
  resolve: {
    alias: {
      'react-is': 'react-is'
    }
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          utils: ['axios', 'date-fns', 'clsx']
        }
      }
    }
  }
})
