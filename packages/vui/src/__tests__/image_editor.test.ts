import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import {
  IMAGE_EDITOR_PLUGIN_NOT_INSTALLED,
  resolveImageEditorTools,
  unimplementedImageEditorPlugin,
  UiPluginName,
  type UiPlugin,
} from '@mmda/core'
import { TestUiBuilder } from './test_builder'

describe('imageEditorPlugin', () => {
  it('throws until image-editor plugin is used', () => {
    const ui = new TestUiBuilder()
    expect(() => ui.requirePlugin(UiPluginName.imageEditor)).toThrow(
      IMAGE_EDITOR_PLUGIN_NOT_INSTALLED,
    )
    expect(unimplementedImageEditorPlugin().imageEditor).toBeTypeOf('function')
  })

  it('uses plugin().buildUi after use()', () => {
    const ui = new TestUiBuilder()
    const plugin: UiPlugin = {
      name: UiPluginName.imageEditor,
      buildUi: (_ctx, props) =>
        h('div', {
          class: 'mmda-image-editor',
          'data-src': (props as { src?: string })?.src,
        }),
    }
    ui.use(plugin)
    const node = ui.plugin(UiPluginName.imageEditor)!.buildUi({} as any, {
      src: '/photo.png',
    })
    expect(node.props?.class).toBe('mmda-image-editor')
    expect(node.props?.['data-src']).toBe('/photo.png')
  })

  it('defaults tools to crop rotate flip', () => {
    expect(resolveImageEditorTools({})).toEqual(['crop', 'rotate', 'flip'])
    expect(resolveImageEditorTools({ tools: ['crop'] })).toEqual(['crop'])
  })
})
