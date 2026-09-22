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
      name: 'MmdaRuiSyncfusion',
      formats: ['es'],
      fileName: () => 'mmda-rui-syncfusion.es.js',
    },
    sourcemap: true,
    rollupOptions: {
      external: ['react', 'react-dom', '@mmda/core', '@mmda/rui', /^@syncfusion\//],
    },
  },
})
