import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

const pkg = (name: string) =>
  fileURLToPath(new URL(`../${name}/src/index.ts`, import.meta.url))
const vuiPrimeSrc = fileURLToPath(
  new URL('../vui-primevue/src/', import.meta.url),
)

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
      {
        find: '@mmda/vui-primevue/src/assets/animate.min.css',
        replacement: fileURLToPath(
          new URL('./src/compat/animate.min.css', import.meta.url),
        ),
      },
      {
        find: '@mmda/vui-primevue/fontawesome.css',
        replacement: fileURLToPath(
          new URL('../vui-primevue/src/fontawesome.css', import.meta.url),
        ),
      },
      {
        find: /^@mmda\/vui-primevue\/src\/(.*)/,
        replacement: `${vuiPrimeSrc}$1`,
      },
      { find: /^@mmda\/core$/, replacement: pkg('core') },
      { find: /^@mmda\/vui-primevue$/, replacement: pkg('vui-primevue') },
      { find: /^@mmda\/vui$/, replacement: pkg('vui') },
      {
        find: /^@mmda\/base(\/.*)?$/,
        replacement: `${fileURLToPath(new URL('../base', import.meta.url))}$1`,
      },
    ],
  },
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler' },
    },
  },
  optimizeDeps: {
    include: ['dhtmlx-gantt', '@vue-office/docx', '@vue-office/excel', 'lodash'],
  },
  server: {
    port: 5176,
    host: '127.0.0.1',
    strictPort: true,
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 2048,
  },
})
