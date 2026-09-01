import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@mmda/vui': fileURLToPath(
        new URL('../vui/src/index.ts', import.meta.url),
      ),
      '@mmda/vui/fontawesome.css': fileURLToPath(
        new URL('../vui/src/fontawesome.css', import.meta.url),
      ),
      '@mmda/vui/theme.css': fileURLToPath(
        new URL('../vui/src/theme.css', import.meta.url),
      ),
      '@mmda/vui/material-symbols.css': fileURLToPath(
        new URL('../vui/src/material-symbols.css', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'jsdom',
  },
})
