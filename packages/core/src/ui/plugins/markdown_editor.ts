/**
 * Markdown 编辑器插件契约。无 Vue。
 * 不进 chrome UiFactory；App 挂 Builder 插件。
 */
import type { UiProps } from '../props'

export interface UiMarkdownEditorProps extends UiProps {
  value?: string
  readonly?: boolean
  width?: string | number
  height?: string | number
  onChange?: (text: string) => void
}

export interface UiMarkdownEditorPlugin<TNode = any> {
  markdownEditor: (props: UiMarkdownEditorProps) => TNode
}

export const MARKDOWN_EDITOR_PLUGIN_NOT_INSTALLED =
  'markdown editor plugin not installed'

function notInstalled(): never {
  throw new Error(MARKDOWN_EDITOR_PLUGIN_NOT_INSTALLED)
}

export function unimplementedMarkdownEditorPlugin<
  TNode = any,
>(): UiMarkdownEditorPlugin<TNode> {
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
