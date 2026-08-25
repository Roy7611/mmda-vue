import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'MmdaVui',
      formats: ['es'],
      fileName: () => 'mmda-vui.es.js',
    },
    sourcemap: true,
    rollupOptions: {
      external: ['vue', 'vue-i18n', 'vue-router', '@mmda/core', 'luxon', 'pluralize'],
    },
  },
})
