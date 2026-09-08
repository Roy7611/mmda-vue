import { describe, expect, it } from 'vitest'
import { createSfImageEditorPlugin } from '../plugins/image_editor'

describe('createSfImageEditorPlugin', () => {
  it('renders imageEditor host with hook class', () => {
    const plugin = createSfImageEditorPlugin()
    const vnode = plugin.imageEditor({
      src: '/photo.png',
      readonly: true,
    })
    expect(vnode.props?.src).toBe('/photo.png')
    expect(vnode.props?.readonly).toBe(true)
  })
})
