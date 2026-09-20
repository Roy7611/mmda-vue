import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const srcDir = join(process.cwd(), 'src')

function collectTsFiles(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...collectTsFiles(full))
    else if (name.endsWith('.ts')) out.push(full)
  }
  return out
}

const dataDirs = ['metaui', 'models', 'net', 'utils', 'di']
const logicImport =
  /from\s+['"](?:@mmda\/core\/src\/logic|(?:\.\.\/)+logic\/|\.\/logic\/)/
const declareGlobal = /\bdeclare\s+global\b/
const frameworkImport =
  /from\s+['"](?:vue|react|@vue[^'"]*|@react[^'"]*)['"]/

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

  it('非测试源码 any 数量不超过 206（防止重新泛滥）', () => {
    const files = collectTsFiles(srcDir).filter(
      (file) => !file.replace(/\\/g, '/').includes('/__tests__/'),
    )
    const count = files.reduce(
      (total, file) =>
        total +
        (readFileSync(file, 'utf8').match(/\bany\b/g)?.length ?? 0),
      0,
    )
    expect(count).toBeLessThanOrEqual(206)
  })
})
