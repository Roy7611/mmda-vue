import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import {
  MARKDOWN_EDITOR_PLUGIN_NOT_INSTALLED,
  unimplementedMarkdownEditorPlugin,
  UiPluginName,
  type UiPlugin,
} from '@mmda/core'
import { TestUiBuilder } from './test_builder'

describe('markdownEditorPlugin', () => {
  it('throws until markdown-editor plugin is used', () => {
    const ui = new TestUiBuilder()
    expect(() => ui.requirePlugin(UiPluginName.markdownEditor)).toThrow(
      MARKDOWN_EDITOR_PLUGIN_NOT_INSTALLED,
    )
    expect(unimplementedMarkdownEditorPlugin().markdownEditor).toBeTypeOf(
      'function',
    )
  })

  it('uses plugin().buildUi after use()', () => {
    const ui = new TestUiBuilder()
    const plugin: UiPlugin = {
      name: UiPluginName.markdownEditor,
      buildUi: (_ctx, props) =>
        h('div', {
          class: 'mmda-markdown-editor',
          'data-readonly': (props as { readonly?: boolean })?.readonly ? '1' : '0',
        }),
    }
    ui.use(plugin)
    const node = ui.plugin(UiPluginName.markdownEditor)!.buildUi({} as any, {
      value: 'x',
      readonly: true,
    } as any)
    expect(node.props?.class).toBe('mmda-markdown-editor')
    expect(node.props?.['data-readonly']).toBe('1')
  })
})
