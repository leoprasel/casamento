import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // pix-utils' unused dynamic-payload path imports Node's Buffer; map it
      // to the browser polyfill so the static BR Code builder bundles cleanly.
      buffer: 'buffer',
    },
  },
  define: {
    global: 'globalThis',
  },
})
