import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'MmdaRuixTempisTimeline',
      formats: ['es'],
      fileName: () => 'mmda-ruix-tempis-timeline.es.js',
    },
    sourcemap: true,
    rollupOptions: {
      external: (id) =>
        id === 'react' ||
        id === 'react-dom' ||
        id.startsWith('react-dom/') ||
        id === '@mmda/core' ||
        id === '@mmda/rui' ||
        id.startsWith('@tempis/'),
    },
  },
})
