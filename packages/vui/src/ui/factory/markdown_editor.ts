/*
 * Markdown 是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setMarkdownEditorPlugin(createMarkdownEditorPlugin())
 */
import type { VNode } from 'vue'
import type { PropData } from '../layout/layout'

export interface UiMarkdownEditorProps extends PropData {
  value?: string
  readonly?: boolean
  width?: string | number
  height?: string | number
  onChange?: (text: string) => void
}

export interface UiMarkdownEditorPlugin {
  markdownEditor: (props: UiMarkdownEditorProps) => VNode
}

export const MARKDOWN_EDITOR_PLUGIN_NOT_INSTALLED =
  'markdown editor plugin not installed'

function notInstalled(): never {
  throw new Error(MARKDOWN_EDITOR_PLUGIN_NOT_INSTALLED)
}

export function unimplementedMarkdownEditorPlugin(): UiMarkdownEditorPlugin {
  return { markdownEditor: notInstalled }
}

export function markdownEditorHookClass(
  extra?: unknown,
  readonly?: boolean,
): unknown[] {
  return [
    'mmda-markdown-editor',
    readonly ? 'mmda-markdown-editor--readonly' : undefined,
    extra,
  ]
}
