import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

const pkg = (name: string) =>
  fileURLToPath(new URL(`../${name}/src/index.ts`, import.meta.url))

const vuiFa = fileURLToPath(
  new URL('../vui/src/fontawesome.css', import.meta.url),
)
const vuiTheme = fileURLToPath(
  new URL('../vui/src/theme.css', import.meta.url),
)
const vuiMaterialSymbols = fileURLToPath(
  new URL('../vui/src/material-symbols.css', import.meta.url),
)

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    dedupe: ['ag-grid-community', 'ag-grid-enterprise', 'ag-grid-vue3', 'naive-ui', 'vue'],
    alias: [
      { find: '@mmda/vui/fontawesome.css', replacement: vuiFa },
      { find: '@mmda/vui/theme.css', replacement: vuiTheme },
      { find: '@mmda/vui/material-symbols.css', replacement: vuiMaterialSymbols },
      { find: '@mmda/core', replacement: pkg('core') },
      { find: '@mmda/vui-agnaive', replacement: pkg('vui-agnaive') },
      { find: '@mmda/vui', replacement: pkg('vui') },
    ],
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
})
