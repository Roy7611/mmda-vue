import { defineConfig, mergeConfig } from 'vitest/config'
// 复用 app 真实的 vite 配置（含 `packageLocalAlias`：`@mmda/vui` / `@mmda/base` 走各自 `src`）。
// 否则 vitest 走 workspace 软链 → 包的 `dist`，测试就会依赖「dist 是不是最新构建产物」。
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
    },
  }),
)
