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

  it('非测试源码 any 数量不超过 272（防止重新泛滥，只算 .ts 不含 .d.ts）', () => {
      // 272 = 270 + 2：UiListSlots 的 `<T = any, TNode = any>` 默认值
      //  （把 vui 私扩的列表数据区插槽上移 core 时新增）。
      // 270 = 267 + 3 处页级插槽 props 的类型参数默认值：
      //   UiViewSlots / UiViewProps / UiListViewProps 各 `<TNode = any>`
      //  （把 vui 私扩的 toolbar / header / content / footer 上移 core 时新增）。
      // 更早的 267 = 263(HEAD) + 4 处渲染器类型参数默认值：
      //   UiFieldCellRenderer / UiGroupRenderer 各 `<TNode = any>`，
      //   MetaUiFieldLogic / MetaUiGroupLogic 各加 `<… , TNode = any>`。
      // 与既有 `UiFactory<TNode = any>` / `UiFieldRenderer<TNode = any>` 同惯例，不是用 any 糊逻辑。
      const files = collectTsFiles(srcDir).filter(
        (file) => !file.replace(/\\/g, '/').includes('/__tests__/'),
      )
      const count = files.reduce(
        (total, file) =>
          total +
          (readFileSync(file, 'utf8').match(/\bany\b/g)?.length ?? 0),
        0,
      )
      expect(count).toBeLessThanOrEqual(272)
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

    it('业务 Logic 不得新增 import vui/rui（残余 ≤ 6）', () => {
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
      // 残余 1 处：`tools/ToolLogic.ts` 的 `rx` —— core 没有框架中立的「值响应式化」入口
      // （`UiContext` 契约明确不收 rx/computed/watch，见 ui/context_base.ts 的注释），
      // 待契约拍板后再归零。
      expect(offenders.length).toBeLessThanOrEqual(1)
    })
})
