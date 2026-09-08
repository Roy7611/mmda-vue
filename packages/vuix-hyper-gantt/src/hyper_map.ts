import {
  ganttLinkTypeCode,
  type UiGanttLink,
  type UiGanttPrintOptions,
  type UiGanttTask,
  type UiGanttViewMode,
  type UiGanttViewProps,
} from '@mmda/vui'

export const PROJECT_SERIALIZER_NOT_INSTALLED =
  'gantt ProjectSerializer not installed'

export type HyperGanttItem = Record<string, unknown> & {
  mmdaId?: string | number
  content?: string
  indentation?: number
  start?: Date
  finish?: Date
  completedFinish?: Date
  isMilestone?: boolean
  isExpanded?: boolean
  isHidden?: boolean
  assignmentsContent?: string
  predecessors?: Array<{
    item: HyperGanttItem
    dependencyType?: string
    lag?: number
  }>
  barStyle?: string
  baselineStart?: Date
  baselineFinish?: Date
  description?: string
  hasChildren?: boolean
}

const DAY_MS = 24 * 60 * 60 * 1000

export const HOUR_WIDTH_OF: Record<UiGanttViewMode, number> = {
  day: 24,
  week: 5,
  month: 1.5,
  quarter: 0.8,
  year: 0.35,
}

export function dateOf(value?: string | Date | null): Date | undefined {
  if (value == null || value === '') return undefined
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function finishOf(task: UiGanttTask): Date | undefined {
  const end = dateOf(task.endDate)
  if (end) return end
  const start = dateOf(task.startDate)
  if (!start || task.duration == null) return undefined
  return new Date(start.getTime() + Number(task.duration) * DAY_MS)
}

export function completedFinishOf(task: UiGanttTask): Date | undefined {
  const start = dateOf(task.startDate)
  const finish = finishOf(task)
  if (!start || !finish) return undefined
  const ratio = Math.min(1, Math.max(0, (task.progress ?? 0) / 100))
  return new Date(start.getTime() + (finish.getTime() - start.getTime()) * ratio)
}

export function progressOf(item: HyperGanttItem): number | undefined {
  const start = item.start instanceof Date ? item.start.getTime() : undefined
  const finish = item.finish instanceof Date ? item.finish.getTime() : undefined
  const done =
    item.completedFinish instanceof Date
      ? item.completedFinish.getTime()
      : undefined
  if (start == null || finish == null || done == null || finish <= start) {
    return undefined
  }
  return Math.round(((done - start) / (finish - start)) * 100)
}

export function tasksInTreeOrder(tasks: UiGanttTask[]): UiGanttTask[] {
  const byId = new Map(tasks.map((task) => [String(task.id), task]))
  const children = new Map<string, UiGanttTask[]>()
  const roots: UiGanttTask[] = []
  for (const task of tasks) {
    const parentId =
      task.parentId == null || task.parentId === ''
        ? null
        : String(task.parentId)
    if (!parentId || !byId.has(parentId)) {
      roots.push(task)
      continue
    }
    const list = children.get(parentId) ?? []
    list.push(task)
    children.set(parentId, list)
  }
  const out: UiGanttTask[] = []
  const seen = new Set<string>()
  const walk = (task: UiGanttTask) => {
    const key = String(task.id)
    if (seen.has(key)) return
    seen.add(key)
    out.push(task)
    for (const child of children.get(key) ?? []) walk(child)
  }
  for (const root of roots) walk(root)
  for (const task of tasks) walk(task)
  return out
}

export function indentationOf(tasks: UiGanttTask[]): Map<string, number> {
  const ordered = tasksInTreeOrder(tasks)
  const depth = new Map<string, number>()
  for (const task of ordered) {
    const parentId =
      task.parentId == null || task.parentId === ''
        ? null
        : String(task.parentId)
    const parentDepth = parentId == null ? -1 : (depth.get(parentId) ?? -1)
    depth.set(String(task.id), parentDepth + 1)
  }
  return depth
}

export function vuiTasksToHyper(
  tasks: UiGanttTask[] = [],
  links: UiGanttLink[] = [],
): HyperGanttItem[] {
  const ordered = tasksInTreeOrder(tasks)
  const depth = indentationOf(tasks)
  const items = ordered.map((task) => {
    const start = dateOf(task.startDate)
    const finish = finishOf(task)
    const item: HyperGanttItem = {
      mmdaId: task.id,
      content: task.name ?? '',
      indentation: depth.get(String(task.id)) ?? 0,
      start,
      finish,
      completedFinish: completedFinishOf(task),
      isMilestone: task.type === 'milestone',
      isExpanded: task.expanded !== false,
      isHidden: !!task.hidden,
      assignmentsContent:
        task.assignments == null ? undefined : String(task.assignments),
      description:
        task.description == null ? undefined : String(task.description),
      baselineStart: dateOf(task.baselineStart as string | Date | null | undefined),
      baselineFinish: dateOf(task.baselineEnd as string | Date | null | undefined),
    }
    if (task.color) {
      item.barStyle = `stroke: ${task.color}; fill: ${task.color}`
    }
    return item
  })
  const byId = new Map(items.map((item) => [String(item.mmdaId), item]))
  for (const link of links) {
    const source = byId.get(String(link.source))
    const target = byId.get(String(link.target))
    if (!source || !target) continue
    const predecessors = target.predecessors ?? []
    predecessors.push({
      item: source,
      dependencyType: ganttLinkTypeCode(link.type),
      lag: link.lag,
    })
    target.predecessors = predecessors
  }
  return items
}

export function hyperItemsToVui(items: HyperGanttItem[] = []): {
  tasks: UiGanttTask[]
  links: UiGanttLink[]
} {
  const stack: HyperGanttItem[] = []
  const tasks: UiGanttTask[] = []
  const links: UiGanttLink[] = []
  items.forEach((item, index) => {
    const indent = Number(item.indentation ?? 0)
    stack.length = indent
    const parent = indent > 0 ? stack[indent - 1] : undefined
    stack[indent] = item
    const id = item.mmdaId ?? index + 1
    item.mmdaId = id
    const hasChildren = !!item.hasChildren
    tasks.push({
      id,
      name: item.content,
      startDate: item.start,
      endDate: item.finish,
      parentId: parent?.mmdaId ?? null,
      progress: progressOf(item),
      type: item.isMilestone
        ? 'milestone'
        : hasChildren
          ? 'project'
          : 'task',
      assignments: item.assignmentsContent,
      expanded: item.isExpanded,
      hidden: item.isHidden,
      baselineStart: item.baselineStart,
      baselineEnd: item.baselineFinish,
      description: item.description,
    })
    for (const pred of item.predecessors ?? []) {
      const sourceId = pred.item?.mmdaId
      if (sourceId == null) continue
      links.push({
        source: sourceId,
        target: id,
        type: ganttLinkTypeCode(pred.dependencyType),
        lag: pred.lag,
      })
    }
  })
  return { tasks, links }
}

export function scalesOf(mode: UiGanttViewMode = 'week') {
  const current = {
    scaleType: 'CurrentTime',
    isHeaderVisible: false,
    isSeparatorVisible: true,
  }
  const off = {
    scaleType: 'NonworkingTime',
    isHeaderVisible: false,
    isHighlightingVisible: true,
  }
  if (mode === 'day') {
    return [
      off,
      { scaleType: 'Days', headerTextFormat: 'Date', isSeparatorVisible: true },
      { scaleType: 'Hours', headerTextFormat: 'Hour' },
      current,
    ]
  }
  if (mode === 'month') {
    return [
      off,
      { scaleType: 'Months', headerTextFormat: 'Month', isSeparatorVisible: true },
      { scaleType: 'Weeks', headerTextFormat: 'Date' },
      current,
    ]
  }
  if (mode === 'quarter') {
    return [
      off,
      { scaleType: 'Years', headerTextFormat: 'Year', isSeparatorVisible: true },
      {
        scaleType: 'Months',
        headerTextFormat: 'Month',
        headerText: undefined,
      },
      current,
    ]
  }
  if (mode === 'year') {
    return [
      off,
      { scaleType: 'Years', headerTextFormat: 'Year', isSeparatorVisible: true },
      { scaleType: 'Months', headerTextFormat: 'MonthAbbreviation' },
      current,
    ]
  }
  return [
    off,
    { scaleType: 'Weeks', headerTextFormat: 'Date', isSeparatorVisible: true },
    { scaleType: 'Days', headerTextFormat: 'DayOfWeekAbbreviation' },
    current,
  ]
}

export function hourWidthOf(props: UiGanttViewProps): number {
  if (props.hourWidth != null) return props.hourWidth
  return HOUR_WIDTH_OF[props.viewMode ?? 'week']
}

export function printSettingsOf(options: UiGanttPrintOptions = {}) {
  return {
    title: options.title,
    isGridVisible: options.gridVisible,
    columnIndexes: options.columnIndexes,
    timelineStart: dateOf(options.timelineStart),
    timelineFinish: dateOf(options.timelineFinish),
    hourWidth: options.hourWidth,
    rotate: options.rotate,
    preparingMessage: options.preparingMessage,
  }
}

export function hyperSettingsOf(
  props: UiGanttViewProps,
  license?: string,
): Record<string, unknown> {
  const readonly = !!props.readonly
  const settings: Record<string, unknown> = {
    isReadOnly: readonly,
    isChartReadOnly: readonly || props.allowTaskDrag === false,
    isTaskEffortReadOnly: readonly || props.allowTaskResize === false,
    areTaskPredecessorsReadOnly: readonly || props.allowLinks === false,
    isGridVisible: props.gridVisible !== false,
    isVirtualizing: props.virtualizing !== false,
    areTaskDependencyConstraintsEnabled: !!props.dependencyConstraints,
    isBaselineVisible: !!props.baselineVisible,
    scales: scalesOf(props.viewMode),
    hourWidth: hourWidthOf(props),
    license: props.license ?? license,
    assignableResources: props.assignableResources,
    specificResourceHourCosts: props.resourceHourCosts,
    resourceQuantities: props.resourceQuantities,
  }
  if (props.gridWidth != null) settings.gridWidth = props.gridWidth
  if (props.chartWidth != null) settings.chartWidth = props.chartWidth
  const timelineStart = dateOf(props.timelineStart)
  const timelineFinish = dateOf(props.timelineFinish)
  const currentTime = dateOf(props.currentTime)
  if (timelineStart) settings.timelineStart = timelineStart
  if (timelineFinish) settings.timelineFinish = timelineFinish
  if (currentTime) settings.currentTime = currentTime
  if (props.workingWeekStart != null) {
    settings.workingWeekStart = props.workingWeekStart
  }
  if (props.workingWeekFinish != null) {
    settings.workingWeekFinish = props.workingWeekFinish
  }
  if (props.specialNonworkingDays) {
    settings.specialNonworkingDays = props.specialNonworkingDays
      .map((day: string | Date) => dateOf(day))
      .filter(Boolean)
  }
  const locale = props.locale ?? ''
  if (locale.startsWith('zh')) {
    settings.weekStartDay = 1
  }
  if (props.columns?.length) {
    settings.columns = props.columns.map((col, index) => ({
      header: col.header ?? col.field,
      width: col.width,
      minWidth: col.minWidth,
      isReadOnly: col.readonly,
      isTreeView: index === 0,
      propertyName: col.field === 'name' ? 'content' : col.field,
    }))
  }
  return settings
}

export function projectRangeOf(tasks: UiGanttTask[] = []): {
  start?: Date
  finish?: Date
} {
  let start: number | undefined
  let finish: number | undefined
  for (const task of tasks) {
    const from = dateOf(task.startDate)?.getTime()
    const to = finishOf(task)?.getTime()
    if (from != null) start = start == null ? from : Math.min(start, from)
    if (to != null) finish = finish == null ? to : Math.max(finish, to)
  }
  return {
    start: start != null ? new Date(start) : undefined,
    finish: finish != null ? new Date(finish) : undefined,
  }
}
