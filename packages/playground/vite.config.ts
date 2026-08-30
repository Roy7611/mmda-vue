import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { syncfusionThemeAliases } from '@mmda/vui-syncfusion/vite'

const pkg = (name: string) =>
  fileURLToPath(new URL(`../${name}/src/index.ts`, import.meta.url))

const vuiFa = fileURLToPath(
  new URL('../vui/src/fontawesome.css', import.meta.url),
)
const vuiTheme = fileURLToPath(
  new URL('../vui/src/theme.css', import.meta.url),
)
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: [
      { find: '@mmda/vui/fontawesome.css', replacement: vuiFa },
      { find: '@mmda/vui/theme.css', replacement: vuiTheme },
      {
        find: '@mmda/vui-primevue/fontawesome.css',
        replacement: vuiFa,
      },
      ...syncfusionThemeAliases,
      { find: '@mmda/core', replacement: pkg('core') },
      { find: '@mmda/vui-primevue', replacement: pkg('vui-primevue') },
      { find: '@mmda/vui-syncfusion', replacement: pkg('vui-syncfusion') },
      { find: '@mmda/vui', replacement: pkg('vui') },
    ],
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
})
