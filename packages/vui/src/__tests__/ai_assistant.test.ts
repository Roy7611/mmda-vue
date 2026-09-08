import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import {
  AI_ASSISTANT_PLUGIN_NOT_INSTALLED,
  unimplementedAiAssistantPlugin,
  type UiAiAssistantPlugin,
} from '../ui/factory/ai_assistant'
import { TestUiBuilder } from './test_builder'

describe('aiAssistantPlugin', () => {
  it('throws until setAiAssistantPlugin', () => {
    const ui = new TestUiBuilder()
    expect(() => ui.buildAiAssistant({ relateTo: '#btn' })).toThrow(
      AI_ASSISTANT_PLUGIN_NOT_INSTALLED,
    )
    expect(() =>
      ui.aiAssistantPlugin.aiAssistant({ relateTo: '#btn' }),
    ).toThrow(AI_ASSISTANT_PLUGIN_NOT_INSTALLED)
    expect(unimplementedAiAssistantPlugin().aiAssistant).toBeTypeOf('function')
  })

  it('uses the plugin after setAiAssistantPlugin', () => {
    const ui = new TestUiBuilder()
    const plugin: UiAiAssistantPlugin = {
      aiAssistant: (props) =>
        h('div', {
          class: 'mmda-ai-assistant',
          'data-relate': props.relateTo,
        }),
    }
    ui.setAiAssistantPlugin(plugin)
    const node = ui.buildAiAssistant({ relateTo: '#summarizeBtn' })
    expect(node.props?.class).toBe('mmda-ai-assistant')
    expect(node.props?.['data-relate']).toBe('#summarizeBtn')
  })
})
