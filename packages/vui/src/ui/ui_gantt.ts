import type { PropData } from './ui_layout'

export type UiGanttTaskType = 'task' | 'milestone' | 'project'

export type UiGanttViewMode = 'day' | 'week' | 'month' | 'quarter' | 'year'

export interface UiGanttTask {
  id: string | number
  name?: string
  startDate?: string | Date | null
  endDate?: string | Date | null
  duration?: number
  parentId?: string | number | null
  progress?: number
  type?: UiGanttTaskType
  readonly?: boolean
  color?: string
  [field: string]: unknown
}

export interface UiGanttLink {
  id?: string | number
  source: string | number
  target: string | number
  type?: string | number
}

export interface UiGanttColumn {
  field: string
  header?: string
  width?: number
  minWidth?: number
  readonly?: boolean
}

export interface UiGanttController {
  refresh: (tasks?: UiGanttTask[], links?: UiGanttLink[]) => void
  select: (ids: Array<string | number>) => void
  expandAll: () => void
  collapseAll: () => void
  setViewMode: (mode: UiGanttViewMode) => void
  fitToProject: () => void
  undo: () => void
  scrollToDate: (date: string | Date) => void
  openEditor: (id: string | number) => void
}

export interface UiGanttChangeEvent<T = unknown> {
  action: string
  task?: UiGanttTask
  link?: UiGanttLink
  tasks?: UiGanttTask[]
  native?: T
}

export interface UiGanttViewProps extends PropData {
  tasks?: UiGanttTask[]
  links?: UiGanttLink[]
  columns?: UiGanttColumn[]
  height?: string | number
  readonly?: boolean
  allowTaskDrag?: boolean
  allowTaskResize?: boolean
  allowLinks?: boolean
  allowRowReorder?: boolean
  viewMode?: UiGanttViewMode
  loading?: boolean
  locale?: string
  onReady?: (controller: UiGanttController) => void
  onTaskChange?: (
    event: UiGanttChangeEvent,
  ) => void | boolean | Promise<void | boolean>
  onLinkChange?: (
    event: UiGanttChangeEvent,
  ) => void | boolean | Promise<void | boolean>
  onTaskSelect?: (ids: Array<string | number>) => void
  onTaskDblClick?: (task: UiGanttTask) => void
  onRowReorder?: (task: UiGanttTask, event?: UiGanttChangeEvent) => void
}

/** @deprecated 使用 UiGanttViewProps */
export type UiGanttChartProps = UiGanttViewProps

export const UI_GANTT_LINK_TYPES = ['FS', 'SS', 'FF', 'SF'] as const

export function ganttLinkTypeCode(type?: string | number): string {
  if (type == null || type === '') return 'FS'
  if (typeof type === 'string' && UI_GANTT_LINK_TYPES.includes(type as any)) {
    return type
  }
  const index = Number(type)
  return UI_GANTT_LINK_TYPES[index] ?? 'FS'
}

export function applyGanttLinksToTasks(
  tasks: UiGanttTask[],
  links: UiGanttLink[] = [],
): UiGanttTask[] {
  const byId = new Map(tasks.map((task) => [String(task.id), { ...task }]))
  for (const link of links) {
    const target = byId.get(String(link.target))
    if (!target) continue
    const token = `${link.source}${ganttLinkTypeCode(link.type)}`
    const current = String(target.dependency ?? '')
    target.dependency = current
      ? `${current},${token}`
      : token
  }
  return [...byId.values()]
}

export function createNoopGanttController(): UiGanttController {
  return {
    refresh: () => undefined,
    select: () => undefined,
    expandAll: () => undefined,
    collapseAll: () => undefined,
    setViewMode: () => undefined,
    fitToProject: () => undefined,
    undo: () => undefined,
    scrollToDate: () => undefined,
    openEditor: () => undefined,
  }
}
