import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@mmda/core': fileURLToPath(new URL('../core/src/index.ts', import.meta.url)),
      '@mmda/vui': fileURLToPath(new URL('../vui/src/index.ts', import.meta.url)),
      '@mmda/base': fileURLToPath(new URL('../base', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
})
