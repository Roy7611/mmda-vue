import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const buildersDir = join(process.cwd(), 'src/ui/builder')
const builderEntry = join(process.cwd(), 'src/ui/builder.ts')

function collectTsFiles(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...collectTsFiles(full))
    else if (name.endsWith('.ts')) out.push(full)
  }
  return out
}

/**
 * 分层真源：`docs/design/layers_architecture.md:63`「如果没有复杂的处理逻辑…
 * （CRUD），这一层是可选的，**允许在 UI 层通过 `UiContext` 中的接口函数直接透过
 * `ApiClient` 接口提交数据**」；`ARCHITECTURE.md:155/162`「通用数据 ──
 * `context.apiClient`（会话/UI 助手；不必经 Logic 再包）」。
 *
 * 因此 `context.apiClient` 是**合法通道**，本测试只守一条：不得绕过会话直接 import
 * Data 层的 `net` 模块（那会让 builder 绑死具体 ApiClient 实现）。
 */
describe('layer boundary: builders', () => {
  it('不得直接 import @mmda/core 的 net 模块（走 context.apiClient）', () => {
    const files = [...collectTsFiles(buildersDir), builderEntry]
    expect(files.length).toBeGreaterThan(0)

    const offenders: string[] = []
    for (const file of files) {
      const src = readFileSync(file, 'utf8')
      if (
        /from\s+['"]@mmda\/core\/.*net/.test(src) ||
        /from\s+['"].*\/net\//.test(src)
      ) {
        offenders.push(file.replace(/\\/g, '/'))
      }
    }
    expect(offenders).toEqual([])
  })
})
