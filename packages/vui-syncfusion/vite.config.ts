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
      name: 'MmdaVuiSyncfusion',
      formats: ['es'],
      fileName: () => 'mmda-vui-syncfusion.es.js',
      cssFileName: 'style',
    },
    sourcemap: true,
    rollupOptions: {
      external: id =>
        id === 'vue' ||
        id === 'vue-i18n' ||
        id === 'vue-router' ||
        id === '@mmda/core' ||
        id === '@mmda/vui' ||
        id.startsWith('@mmda/vui/') ||
        id.startsWith('@syncfusion/') ||
        id.startsWith('@vue-office/'),
    },
  },
})
