import type { UiBuilder } from '../builder'
import type { UiContext } from '../context'
import type { UiProps } from '../props'

/**
 * UI 引擎插件。App / 皮肤 `builder.use(plugin)`；渲染走 {@link buildUi}。
 * 无 Vue。
 */
export interface UiPlugin<TNode = any> {
  readonly name: string
  install?(builder: UiBuilder<TNode>): void
  buildUi(context: UiContext, props?: UiProps): TNode
}

/** 已登记插件名（kebab-case）。Index 薄封装用 gantt / scheduler 等。 */
export const UiPluginName = {
  gantt: 'gantt',
  scheduler: 'scheduler',
  kanban: 'kanban',
  diagram: 'diagram',
  timeline: 'timeline',
  markdownEditor: 'markdown-editor',
  imageEditor: 'image-editor',
  pivotTable: 'pivot-table',
  ribbon: 'ribbon',
  aiAssistant: 'ai-assistant',
  chart: 'chart',
} as const

export type UiPluginNameType = (typeof UiPluginName)[keyof typeof UiPluginName]

export function uiPlugin<TNode = any>(
  name: string,
  buildUi: UiPlugin<TNode>['buildUi'],
  install?: UiPlugin<TNode>['install'],
): UiPlugin<TNode> {
  return { name, buildUi, install }
}
