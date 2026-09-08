/*
 * AI 助手是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setAiAssistantPlugin(createSfAiAssistantPlugin())
 */
import type { VNode } from 'vue'
import type { PropData } from '../layout/layout'

export type UiAiResponseMode = 'inline' | 'popup'

export interface UiAiPromptRequest {
  prompt: string
  respond: (text: string) => void
}

export interface UiAiAssistantController {
  showPopup: () => void
  hidePopup: () => void
  addResponse: (text: string) => void
}

export interface UiAiAssistantProps extends PropData {
  relateTo?: string
  prompt?: string
  promptPlaceholder?: string
  popupWidth?: string | number
  responseMode?: UiAiResponseMode
  onPromptRequest?: (request: UiAiPromptRequest) => void | Promise<void>
  onReady?: (controller: UiAiAssistantController) => void
  options?: Record<string, unknown>
}

export interface UiAiAssistantPlugin {
  aiAssistant: (props: UiAiAssistantProps) => VNode
}

export const AI_ASSISTANT_PLUGIN_NOT_INSTALLED =
  'ai assistant plugin not installed'

function notInstalled(): never {
  throw new Error(AI_ASSISTANT_PLUGIN_NOT_INSTALLED)
}

export function unimplementedAiAssistantPlugin(): UiAiAssistantPlugin {
  return { aiAssistant: notInstalled }
}

export function aiAssistantHookClass(extra?: unknown): unknown[] {
  return ['mmda-ai-assistant', extra]
}
