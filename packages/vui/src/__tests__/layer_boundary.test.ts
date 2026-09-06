import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const buildersDir = join(process.cwd(), 'src/ui/builder')

function collectTsFiles(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...collectTsFiles(full))
    else if (name.endsWith('.ts')) out.push(full)
  }
  return out
}

describe('layer boundary: builders', () => {
  it('不得 import @mmda/core net，也不得直接碰 .apiClient', () => {
    const files = collectTsFiles(buildersDir)
    expect(files.length).toBeGreaterThan(0)

    const offenders: string[] = []
    for (const file of files) {
      const src = readFileSync(file, 'utf8')
      if (
        /from\s+['"]@mmda\/core\/.*net/.test(src) ||
        /from\s+['"].*\/net\//.test(src) ||
        /\.apiClient\b/.test(src)
      ) {
        offenders.push(file.replace(/\\/g, '/'))
      }
    }
    expect(offenders).toEqual([])
  })
})
