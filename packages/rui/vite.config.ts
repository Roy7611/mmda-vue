import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'MmdaRui',
      formats: ['es'],
      fileName: () => 'mmda-rui.es.js',
    },
    sourcemap: true,
    rollupOptions: {
      external: ['react', 'react-dom', '@mmda/core'],
    },
  },
})