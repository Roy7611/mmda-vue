import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

const pkg = (name: string) =>
  fileURLToPath(new URL(`../${name}/src/index.ts`, import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@mmda/core': pkg('core'),
      '@mmda/vui': pkg('vui'),
      '@mmda/vui-primevue': pkg('vui-primevue'),
      '@mmda/vui-primevue/fontawesome.css': fileURLToPath(
        new URL('../vui-primevue/src/fontawesome.css', import.meta.url),
      ),
    },
  },
  server: {
    port: 5174,
    host: '127.0.0.1',
  },
})

