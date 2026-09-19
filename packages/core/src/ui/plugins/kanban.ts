/**
 * 看板插件契约。无 Vue。
 * 不进 chrome UiFactory；App 挂 Builder 插件。
 */
import type { UiEventArgs } from '../events'
import type { UiProps } from '../props'

export type UiKanbanChangeAction = 'move' | 'update' | 'add' | 'delete'

export interface UiKanbanCard {
  id: string | number
  title?: string
  status?: string | number
  summary?: string
  tags?: string | string[]
  assignee?: string | string[]
  order?: number
  priority?: string | number
  progress?: number
  dueDate?: string | Date | null
  [field: string]: unknown
}

export interface UiKanbanColumn {
  key: string | number
  header: string
  allowToggle?: boolean
  collapsed?: boolean
  maxCount?: number
  showCount?: boolean
}

export interface UiKanbanChangeEventArgs extends UiEventArgs {
  action: UiKanbanChangeAction
  card: UiKanbanCard
  fromStatus?: string | number
  toStatus?: string | number
  beforeId?: string | number | null
}

export interface UiKanbanProps extends UiProps {
  cards?: UiKanbanCard[]
  columns?: UiKanbanColumn[]
  readonly?: boolean
  allowDragAndDrop?: boolean
  allowAddCard?: boolean
  virtualizing?: boolean
  width?: string | number
  height?: string | number
  onCardChange?: (
    event: UiKanbanChangeEventArgs,
  ) => void | boolean | Promise<void | boolean>
  onCardClick?: (card: UiKanbanCard) => void
  onCardDblClick?: (card: UiKanbanCard) => void
  onColumnToggle?: (column: UiKanbanColumn, collapsed: boolean) => void
}

export interface UiKanbanPlugin<TNode = any> {
  kanbanView: (props: UiKanbanProps) => TNode
}

export const KANBAN_PLUGIN_NOT_INSTALLED = 'kanban plugin not installed'

function notInstalled(): never {
  throw new Error(KANBAN_PLUGIN_NOT_INSTALLED)
}

export function unimplementedKanbanPlugin<TNode = any>(): UiKanbanPlugin<TNode> {
  return { kanbanView: notInstalled }
}

export function kanbanHookClass(
  extra?: unknown,
  readonly?: boolean,
): unknown[] {
  return ['mmda-kanban', readonly ? 'mmda-kanban--readonly' : undefined, extra]
}

export function kanbanDragEnabled(
  props: Pick<UiKanbanProps, 'readonly' | 'allowDragAndDrop'>,
): boolean {
  if (props.readonly) return false
  return props.allowDragAndDrop !== false
}

export function kanbanAddCardEnabled(
  props: Pick<UiKanbanProps, 'readonly' | 'allowAddCard'>,
): boolean {
  if (props.readonly) return false
  return props.allowAddCard === true
}

export async function emitKanbanChange(
  handler: UiKanbanProps['onCardChange'] | undefined,
  event: UiKanbanChangeEventArgs,
): Promise<boolean> {
  if (!handler) return true
  return (await handler(event)) !== false
}
