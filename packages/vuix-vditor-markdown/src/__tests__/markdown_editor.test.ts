import { describe, expect, it } from 'vitest'
import { createMarkdownEditorPlugin } from '../index'

describe('createMarkdownEditorPlugin', () => {
  it('returns a markdownEditor host', () => {
    const plugin = createMarkdownEditorPlugin()
    const vnode = plugin.buildUi({} as any, {
      value: '# hello',
      readonly: true,
    })
    expect(vnode.props?.value).toBe('# hello')
    expect(vnode.props?.readonly).toBe(true)
  })
})
