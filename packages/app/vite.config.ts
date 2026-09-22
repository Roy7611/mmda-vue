import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { syncfusionThemeAliases } from '../vui-syncfusion/vite_aliases'

const root = (path: string) => fileURLToPath(new URL(path, import.meta.url))
const pkg = (name: string) => root(`../${name}/src/index.ts`)

/** Resolve generated `@/...` imports relative to their owning package. */
function packageLocalAlias(): Plugin {
  return {
    name: 'mmda-package-local-alias',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (!source.startsWith('@/') || !importer) return null
      const normalized = importer.replace(/\\/g, '/')
      for (const name of ['base', 'mes', 'app']) {
        if (normalized.includes(`/packages/${name}/`)) {
          return this.resolve(
            root(`../${name}/src/${source.slice(2)}`),
            importer,
            { skipSelf: true },
          )
        }
      }
      return null
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [packageLocalAlias(), vue(), vueJsx()],
  resolve: {
    dedupe: ['vue'],
    alias: [
      ...syncfusionThemeAliases,
      {
        find: /^@mmda\/base\/(.*)$/,
        replacement: `${root('../base')}/$1`,
      },
      {
        find: /^@mmda\/mes\/(.*)$/,
        replacement: `${root('../mes')}/$1`,
      },
      {
        find: '@mmda/vui/fontawesome.css',
        replacement: root('../vui/src/assets/css/fontawesome.css'),
      },
      {
        find: '@mmda/vui/theme.css',
        replacement: root('../vui/src/assets/css/theme.css'),
      },
      {
        find: '@mmda/vui/material-symbols.css',
        replacement: root('../vui/src/assets/css/material-symbols.css'),
      },
      { find: '@mmda/core', replacement: pkg('core') },
      { find: '@mmda/vuix-vditor-markdown', replacement: pkg('vuix-vditor-markdown') },
      { find: '@mmda/vuix-office', replacement: pkg('vuix-office') },
      { find: '@mmda/vui-syncfusion/gantt', replacement: root('../vui-syncfusion/src/plugins/gantt.ts') },
      { find: '@mmda/vui-syncfusion/kanban', replacement: root('../vui-syncfusion/src/plugins/kanban.ts') },
      { find: '@mmda/vui-syncfusion/scheduler', replacement: root('../vui-syncfusion/src/plugins/scheduler.ts') },
      { find: '@mmda/vui-syncfusion/schedule', replacement: root('../vui-syncfusion/src/plugins/scheduler.ts') },
      { find: '@mmda/vui-syncfusion/pivot', replacement: root('../vui-syncfusion/src/plugins/pivot_table.ts') },
      { find: /^@mmda\/vui-syncfusion$/, replacement: pkg('vui-syncfusion') },
      { find: '@mmda/vui', replacement: pkg('vui') },
    ],
  },
  optimizeDeps: {
    include: ['@vue-office/docx', '@vue-office/excel'],
  },
  server: {
    port: 5174,
    host: '127.0.0.1',
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.MMDA_API_GATEWAY || 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 2048,
  },
})
