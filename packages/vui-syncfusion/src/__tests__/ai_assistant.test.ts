import { describe, expect, it, vi } from 'vitest'
import { AI_ASSISTANT_PLUGIN_NOT_INSTALLED } from '@mmda/vui'
import { SyncfusionUiBuilder } from '../syncfusion_builder'
import {
  createSfAiAssistantPlugin,
  wrapAiPromptRequest,
} from '../factory/ai_assistant'

describe('createSfAiAssistantPlugin', () => {
  it('renders aiAssistant host with props', () => {
    const plugin = createSfAiAssistantPlugin()
    const vnode = plugin.aiAssistant({
      relateTo: '#summarizeBtn',
      prompt: '总结',
      responseMode: 'popup',
      popupWidth: 500,
    })
    expect(vnode.props?.relateTo).toBe('#summarizeBtn')
    expect(vnode.props?.prompt).toBe('总结')
    expect(vnode.props?.responseMode).toBe('popup')
    expect(vnode.props?.popupWidth).toBe(500)
  })

  it('wraps promptRequest respond onto addResponse', () => {
    const addResponse = vi.fn()
    const onPromptRequest = vi.fn(({ respond }) => {
      respond('ok')
    })
    wrapAiPromptRequest(onPromptRequest, addResponse, 'fallback')({
      prompt: 'hello',
    })
    expect(onPromptRequest).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: 'hello' }),
    )
    expect(addResponse).toHaveBeenCalledWith('ok')
  })

  it('throws until setAiAssistantPlugin on the skin builder', () => {
    const builder = new SyncfusionUiBuilder()
    expect(() => builder.buildAiAssistant({ relateTo: '#btn' })).toThrow(
      AI_ASSISTANT_PLUGIN_NOT_INSTALLED,
    )
    builder.setAiAssistantPlugin(createSfAiAssistantPlugin())
    const vnode = builder.buildAiAssistant({
      relateTo: '#btn',
      prompt: 'hi',
    })
    expect(vnode.props?.relateTo).toBe('#btn')
  })
})
