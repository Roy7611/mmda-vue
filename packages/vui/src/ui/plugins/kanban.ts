/*
 * 看板是 Builder 插件，不进 chrome UiFactory。
 * App / 皮肤：builder.use(createSfKanbanPlugin()) 或 createVueKanbanPlugin()。
 * 契约在 @mmda/core。
 */
import type { VNode } from 'vue'
import type { UiKanbanPlugin as CorePlugin } from '@mmda/core'

export type {
  UiKanbanChangeAction,
  UiKanbanCard,
  UiKanbanColumn,
  UiKanbanChangeEventArgs,
  UiKanbanProps,
  UiKanbanPlugin,
} from '@mmda/core'

export {
  KANBAN_PLUGIN_NOT_INSTALLED,
  unimplementedKanbanPlugin,
  kanbanHookClass,
  kanbanDragEnabled,
  kanbanAddCardEnabled,
  emitKanbanChange,
} from '@mmda/core'

/** vui 钉成 VNode。 */
export type VueKanbanPlugin = CorePlugin<VNode>
