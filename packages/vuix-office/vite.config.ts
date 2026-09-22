import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'MmdaVuiOffice',
      formats: ['es'],
      fileName: () => 'mmda-vuix-office.es.js',
    },
    sourcemap: true,
    rollupOptions: {
      external: (id) =>
        id === 'vue' ||
        id === '@mmda/vui' ||
        id.startsWith('@mmda/vui/') ||
        id === '@mmda/core' ||
        id.startsWith('@mmda/core/') ||
        id.startsWith('@vue-office/'),
    },
  },
})
