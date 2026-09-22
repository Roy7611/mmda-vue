import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import {
  AI_ASSISTANT_PLUGIN_NOT_INSTALLED,
  unimplementedAiAssistantPlugin,
  UiPluginName,
  type UiPlugin,
} from '@mmda/core'
import { TestUiBuilder } from './test_builder'

describe('aiAssistantPlugin', () => {
  it('throws until ai-assistant plugin is used', () => {
    const ui = new TestUiBuilder()
    expect(() => ui.requirePlugin(UiPluginName.aiAssistant)).toThrow(
      AI_ASSISTANT_PLUGIN_NOT_INSTALLED,
    )
    expect(unimplementedAiAssistantPlugin().aiAssistant).toBeTypeOf('function')
  })

  it('uses plugin().buildUi after use()', () => {
    const ui = new TestUiBuilder()
    const plugin: UiPlugin = {
      name: UiPluginName.aiAssistant,
      buildUi: (_ctx, props) =>
        h('div', {
          class: 'mmda-ai-assistant',
          'data-relate': (props as { relateTo?: string })?.relateTo,
        }),
    }
    ui.use(plugin)
    const node = ui.plugin(UiPluginName.aiAssistant)!.buildUi({} as any, {
      relateTo: '#summarizeBtn',
    } as any)
    expect(node.props?.class).toBe('mmda-ai-assistant')
    expect(node.props?.['data-relate']).toBe('#summarizeBtn')
  })
})
