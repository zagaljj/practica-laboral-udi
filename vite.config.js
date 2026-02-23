import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // mammoth uses 'global' which doesn't exist in browsers
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['mammoth'],
  },
})
