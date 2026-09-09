/**
 * AI 助手插件契约。无 Vue。
 * 不进 chrome UiFactory；App 挂 Builder 插件。
 */
import type { UiProps } from '../props'

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

export interface UiAiAssistantProps extends UiProps {
  relateTo?: string
  prompt?: string
  promptPlaceholder?: string
  popupWidth?: string | number
  responseMode?: UiAiResponseMode
  onPromptRequest?: (request: UiAiPromptRequest) => void | Promise<void>
  onReady?: (controller: UiAiAssistantController) => void
  options?: Record<string, unknown>
}

export interface UiAiAssistantPlugin<TNode = any> {
  aiAssistant: (props: UiAiAssistantProps) => TNode
}

export const AI_ASSISTANT_PLUGIN_NOT_INSTALLED =
  'ai assistant plugin not installed'

function notInstalled(): never {
  throw new Error(AI_ASSISTANT_PLUGIN_NOT_INSTALLED)
}

export function unimplementedAiAssistantPlugin<
  TNode = any,
>(): UiAiAssistantPlugin<TNode> {
  return { aiAssistant: notInstalled }
}

export function aiAssistantHookClass(extra?: unknown): unknown[] {
  return ['mmda-ai-assistant', extra]
}
