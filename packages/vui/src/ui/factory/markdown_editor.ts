/*
 * Markdown 是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setMarkdownEditorPlugin(createMarkdownEditorPlugin())
 * 契约在 @mmda/core。
 */
import type { VNode } from 'vue'
import type { UiMarkdownEditorPlugin as CorePlugin } from '@mmda/core'

export type {
  UiMarkdownEditorProps,
  UiMarkdownEditorPlugin,
} from '@mmda/core'

export {
  MARKDOWN_EDITOR_PLUGIN_NOT_INSTALLED,
  unimplementedMarkdownEditorPlugin,
  markdownEditorHookClass,
} from '@mmda/core'

/** vui 钉成 VNode。 */
export type VueMarkdownEditorPlugin = CorePlugin<VNode>
