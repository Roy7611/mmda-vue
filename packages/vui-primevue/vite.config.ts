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
      name: 'MmdaVuiPrimeVue',
      formats: ['es'],
      fileName: () => 'mmda-vui-primevue.es.js',
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
        id === 'primevue' ||
        id.startsWith('primevue/') ||
        id.startsWith('@primevue/themes') ||
        id === 'chart.js' ||
        id === 'qrcode' ||
        id === 'jsbarcode' ||
        id.startsWith('bpmn-js') ||
        id.startsWith('bpmn-js-properties-panel') ||
        id.startsWith('@bpmn-io/') ||
        id.startsWith('camunda-bpmn-moddle') ||
        id.startsWith('@vue-office/'),
    },
  },
})
