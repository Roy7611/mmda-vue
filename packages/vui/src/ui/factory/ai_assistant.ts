/*
 * AI 助手是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setAiAssistantPlugin(createSfAiAssistantPlugin())
 * 契约在 @mmda/core。
 */
import type { VNode } from 'vue'
import type { UiAiAssistantPlugin as CorePlugin } from '@mmda/core'

export type {
  UiAiResponseMode,
  UiAiPromptRequest,
  UiAiAssistantController,
  UiAiAssistantProps,
  UiAiAssistantPlugin,
} from '@mmda/core'

export {
  AI_ASSISTANT_PLUGIN_NOT_INSTALLED,
  unimplementedAiAssistantPlugin,
  aiAssistantHookClass,
} from '@mmda/core'

/** vui 钉成 VNode。 */
export type VueAiAssistantPlugin = CorePlugin<VNode>
