import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@mmda/vui': fileURLToPath(
        new URL('../vui/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'jsdom',
  },
})
