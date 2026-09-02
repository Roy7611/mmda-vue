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
      name: 'MmdaVuiAgNaive',
      formats: ['es'],
      fileName: () => 'mmda-vui-agnaive.es.js',
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
        id === '@mmda/vui/fontawesome.css' ||
        id === '@mmda/vui/theme.css' ||
        id === '@mmda/vui/material-symbols.css' ||
        id === 'naive-ui' ||
        id === 'ag-grid-community' ||
        id === 'ag-grid-enterprise' ||
        id === 'ag-grid-vue3' ||
        id.startsWith('ag-grid-') ||
        id === 'bpmn-js' ||
        id.startsWith('bpmn-js/') ||
        id === 'jsbarcode' ||
        id === 'qrcode' ||
        id.startsWith('@vue-office/'),
    },
  },
})
