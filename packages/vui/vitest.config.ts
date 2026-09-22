import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@mmda/vui': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      '@mmda/core': fileURLToPath(new URL('../core/src/index.ts', import.meta.url)),
      '@mmda/i18n/src': fileURLToPath(new URL('../i18n/src', import.meta.url)),
      '@mmda/i18n': fileURLToPath(new URL('../i18n/src/index.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
})
