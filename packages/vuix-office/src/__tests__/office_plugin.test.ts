import { describe, expect, it } from 'vitest'
import { createOfficePlugin } from '../index'

describe('createOfficePlugin', () => {
  it('builds an xlsx preview for xlsx/xls extensions', () => {
    const plugin = createOfficePlugin()
    const vnode = plugin.buildUi({} as any, {
      source: 'a.xlsx',
      extension: 'xlsx',
    } as any)
    expect((vnode.type as any).name).toBe('XlsxFilePreview')
  })

  it('builds a docx preview by default', () => {
    const plugin = createOfficePlugin()
    const vnode = plugin.buildUi({} as any, { source: 'a.docx' } as any)
    expect((vnode.type as any).name).toBe('DocxFilePreview')
  })
})
