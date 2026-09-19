import { describe, expect, it, vi } from 'vitest'
import { SyncfusionUiBuilder } from '../syncfusion_builder'
import {
  createSfAiAssistantPlugin,
  wrapAiPromptRequest,
} from '../plugins/ai_assistant'

describe('createSfAiAssistantPlugin', () => {
  it('renders aiAssistant host with props', () => {
    const plugin = createSfAiAssistantPlugin()
    const vnode = plugin.buildUi({} as any, {
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

  it('skin builder installs ai-assistant by default', () => {
    const builder = new SyncfusionUiBuilder()
    expect(builder.hasPlugin('ai-assistant')).toBe(true)
    const vnode = builder.plugin('ai-assistant')!.buildUi({} as any, {
      relateTo: '#btn',
      prompt: 'hi',
    })
    expect(vnode.props?.relateTo).toBe('#btn')
  })
})
