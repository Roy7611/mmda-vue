import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'MmdaVuiFcScheduler',
      formats: ['es'],
      fileName: () => 'mmda-vuix-fc-scheduler.es.js',
    },
    sourcemap: true,
    rollupOptions: {
      external: (id) =>
        id === 'vue' ||
        id === '@mmda/vui' ||
        id.startsWith('@fullcalendar/') ||
        id === 'rrule',
    },
  },
})
