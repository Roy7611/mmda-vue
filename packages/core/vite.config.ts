import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'MmdaCore',
      formats: ['es'],
      fileName: () => 'mmda-core.es.js',
    },
    sourcemap: true,
    rollupOptions: {
      external: ['luxon', 'pluralize'],
    },
  },
})
