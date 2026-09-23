import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const srcDir = join(process.cwd(), 'src')

function collectTsFiles(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...collectTsFiles(full))
    else if (name.endsWith('.ts') && !name.endsWith('.d.ts')) out.push(full)
  }
  return out
}

const dataDirs = ['metaui', 'models', 'net', 'utils', 'di']
const logicImport =
  /from\s+['"](?:@mmda\/core\/src\/logic|(?:\.\.\/)+logic\/|\.\/logic\/)/
const declareGlobal = /\bdeclare\s+global\b/
const frameworkImport =
  /from\s+['"](?:(?:vue|react)(?:-[a-z]+)?|@vue[^'"]*|@react[^'"]*)['"]/

describe('architecture gate', () => {
  it('Data 不得反向 import logic', () => {
    const offenders: string[] = []
    for (const dir of dataDirs) {
      for (const file of collectTsFiles(join(srcDir, dir))) {
        if (logicImport.test(readFileSync(file, 'utf8'))) {
          offenders.push(file.replace(/\\/g, '/'))
        }
      }
    }
    expect(offenders).toEqual([])
  })

  it('不得新增 declare global（禁止原型污染）', () => {
    const offenders = collectTsFiles(srcDir).filter(
      (file) =>
        !file.replace(/\\/g, '/').includes('/__tests__/') &&
        declareGlobal.test(readFileSync(file, 'utf8')),
    )
    expect(offenders).toEqual([])
  })

  it('Logic 保持纯 TS，不得 import vue/react', () => {
    const offenders = collectTsFiles(join(srcDir, 'logic')).filter((file) =>
      frameworkImport.test(readFileSync(file, 'utf8')),
    )
    expect(offenders).toEqual([])
  })

  it('非测试源码 any 数量不超过 150（只算真实 any，排除 `<T = any>` 泛型默认值）', () => {
      // 门禁只数「真实 any」，不数 `TNode = any` / `T = any` 这类类型参数默认值——
      // 它们是渲染器 / 插槽的框架惯例（UiFactory / UiFieldRenderer / UiViewSlots…），
      // 不应阻止正常新增。真实 any = 全部 `\bany\b` 减去 `=\s*any\b`（泛型默认值）。
      // 150 = 135（2026-09 P4 收口后真实计数）+ 15 余量防误报。
      // 135 的收敛点：AbstractUiContext 的 app/apiClient/uiBuilder getter 由 any 改为
      //   MmdaApplication / ApiClient / UiBuilder；utils/tools.getNodePath 泛型化；
      //   models/metamodel 与 ui/factory/multi_select 去除冗余 `as any`。
      const files = collectTsFiles(srcDir).filter(
        (file) => !file.replace(/\\/g, '/').includes('/__tests__/'),
      )
      const count = files.reduce(
        (total, file) => {
          const text = readFileSync(file, 'utf8')
          const all = text.match(/\bany\b/g)?.length ?? 0
          const defaults = text.match(/=\s*any\b/g)?.length ?? 0
          return total + (all - defaults)
        },
        0,
      )
      expect(count).toBeLessThanOrEqual(150)
    })

    it('业务包 *Logic.ts 不得 import UI 框架（vue / vue-router / vue-i18n / react）', () => {
      const monorepoRoot = join(process.cwd(), '..')
      const framework = /from\s+['"](?:(?:vue|react)(?:-[a-z]+)?|@vue[^'"]*|@react[^'"]*)['"]/
      const offenders: string[] = []
      for (const pkg of ['base', 'mes']) {
        const modDir = join(monorepoRoot, pkg, 'src', 'modules')
        for (const file of collectTsFiles(modDir)) {
          if (!file.endsWith('Logic.ts')) continue
          if (framework.test(readFileSync(file, 'utf8'))) {
            offenders.push(file.replace(/\\/g, '/'))
          }
        }
      }
      expect(offenders).toEqual([])
    })

    it('业务 Logic 不得 import vui/rui（零容忍）', () => {
      const monorepoRoot = join(process.cwd(), '..')
      const runtimeImport = /from\s+['"']@mmda\/(?:vui|rui)['"]/
      const offenders: string[] = []
      for (const pkg of ['base', 'mes']) {
        const modDir = join(monorepoRoot, pkg, 'src', 'modules')
        for (const file of collectTsFiles(modDir)) {
          if (!file.endsWith('Logic.ts')) continue
          if (runtimeImport.test(readFileSync(file, 'utf8'))) {
            offenders.push(file.replace(/\\/g, '/'))
          }
        }
      }
      // Logic 不管响应式：响应式是 UI 框架内部设施（core RxFactory 只服务 context 内部状态），
      // Logic 越界 import vui/rui 即失败，无残余名额。
      expect(offenders).toEqual([])
    })
})
