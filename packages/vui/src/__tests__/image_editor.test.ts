import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import {
  IMAGE_EDITOR_PLUGIN_NOT_INSTALLED,
  resolveImageEditorTools,
  unimplementedImageEditorPlugin,
  type UiImageEditorPlugin,
} from '../ui/factory/image_editor'
import { TestUiBuilder } from './test_builder'

describe('imageEditorPlugin', () => {
  it('throws until setImageEditorPlugin', () => {
    const ui = new TestUiBuilder()
    expect(() => ui.imageEditorPlugin.imageEditor({ src: '/a.png' })).toThrow(
      IMAGE_EDITOR_PLUGIN_NOT_INSTALLED,
    )
    expect(unimplementedImageEditorPlugin().imageEditor).toBeTypeOf('function')
  })

  it('uses the plugin after setImageEditorPlugin', () => {
    const ui = new TestUiBuilder()
    const plugin: UiImageEditorPlugin = {
      imageEditor: (props) =>
        h('div', {
          class: 'mmda-image-editor',
          'data-src': props.src,
        }),
    }
    ui.setImageEditorPlugin(plugin)
    const node = ui.buildImageEditor({ src: '/photo.png' })
    expect(node.props?.class).toBe('mmda-image-editor')
    expect(node.props?.['data-src']).toBe('/photo.png')
  })

  it('defaults tools to crop rotate flip', () => {
    expect(resolveImageEditorTools({})).toEqual(['crop', 'rotate', 'flip'])
    expect(resolveImageEditorTools({ tools: ['crop'] })).toEqual(['crop'])
  })
})
