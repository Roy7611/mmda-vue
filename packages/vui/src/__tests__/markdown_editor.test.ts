import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import {
  MARKDOWN_EDITOR_PLUGIN_NOT_INSTALLED,
  unimplementedMarkdownEditorPlugin,
  type UiMarkdownEditorPlugin,
} from '../ui/factory/markdown_editor'
import { TestUiBuilder } from './test_builder'

describe('markdownEditorPlugin', () => {
  it('throws until setMarkdownEditorPlugin', () => {
    const ui = new TestUiBuilder()
    expect(() =>
      ui.markdownEditorPlugin.markdownEditor({ value: '# hi' }),
    ).toThrow(MARKDOWN_EDITOR_PLUGIN_NOT_INSTALLED)
    expect(unimplementedMarkdownEditorPlugin().markdownEditor).toBeTypeOf(
      'function',
    )
  })

  it('uses the plugin after setMarkdownEditorPlugin', () => {
    const ui = new TestUiBuilder()
    const plugin: UiMarkdownEditorPlugin = {
      markdownEditor: (props) =>
        h('div', {
          class: 'mmda-markdown-editor',
          'data-readonly': props.readonly ? '1' : '0',
        }),
    }
    ui.setMarkdownEditorPlugin(plugin)
    const node = ui.buildMarkdownEditor({ value: 'x', readonly: true })
    expect(node.props?.class).toBe('mmda-markdown-editor')
    expect(node.props?.['data-readonly']).toBe('1')
  })
})
