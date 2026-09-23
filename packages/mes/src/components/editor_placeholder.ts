import type { UiContext } from '@mmda/core'

/**
 * 占位编辑器节点：旧仓那些逐文件 Editor 还没迁进来，弹层又要一个节点时显示这段提示。
 *
 * 用 `UiBuilder.factory`（UiFactory 接口）造节点 —— 业务 Logic 因此不必 import 任何 UI 框架，
 * 也拿得到跨框架的节点（Vue 是 VNode，React 是 ReactNode）。
 */
export function editorPlaceholder<TNode>(context: UiContext, hintKey: string): TNode {
  return context.uiBuilder.factory.textSpan({
    text: context.t(hintKey),
    style: { padding: '16px' },
  })
}
