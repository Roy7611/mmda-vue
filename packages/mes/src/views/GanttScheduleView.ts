/*
 * 排产甘特页（框架无关）：壳 + 工具栏 + `context.uiBuilder.buildGantt(...)`。
 *
 * 业务包里只有 UI 交互逻辑（按钮/下拉调 session 或 controller）与业务逻辑
 * （`GanttScheduleSession`）；框架能力全走 `UiContext` / `UiBuilder` / `UiFactory`。
 * 生产排产与项目排产共用这一份，差异由 {@link GanttScheduleViewOptions} 给。
 */
import type {
  UiContext,
  UiGanttTimeScale,
  UiGanttTask,
  UiViewDeps,
} from '@mmda/core'
import {
  GanttScheduleSession,
  type GanttScheduleData,
} from '../schedule/ganttScheduleSession'

export interface GanttScheduleViewOptions {
  /** 壳上的变体 class：`ganttBoxWrapper--schedule` / `--project`。 */
  variant: 'schedule' | 'project'
  /** 甘特数据仓储，如 `ProductionScheduleTasks`。 */
  repository: string
  /** 取数 action，如 `getAllSchedule`。 */
  loadAction: string
  /** 接口返回 → 甘特数据。 */
  mapPayload: (list: unknown) => GanttScheduleData
  /** 该行是否禁止拖拽。 */
  isTaskLocked?: (task: UiGanttTask) => boolean
  /** 是否允许拖行排序（项目排产允许）。 */
  allowRowReorder?: boolean
  /** 撤销时是否先调甘特自己的 `undo()`（生产排产要）。 */
  undoController?: boolean
  service?: string
}

const TIME_SCALES: UiGanttTimeScale[] = ['day', 'week', 'month', 'quarter', 'year']

/** 一个屏一个会话（视图函数每次渲染重跑，状态不能放函数里）。 */
const sessions = new WeakMap<UiContext, GanttScheduleSession>()

function errorMessage(error: unknown): string {
  const value = error as { validationErrors?: Array<{ error?: string }>; message?: string }
  return value?.validationErrors?.[0]?.error ?? value?.message ?? String(error)
}

function sessionFor<TNode>(
  context: UiContext,
  deps: UiViewDeps<TNode>,
  options: GanttScheduleViewOptions,
): GanttScheduleSession {
  const cached = sessions.get(context)
  if (cached) return cached
  const session = new GanttScheduleSession({
    apiClient: context.apiClient,
    repository: options.repository,
    service: options.service ?? 'mes',
    loadAction: options.loadAction,
    mapPayload: options.mapPayload,
    isTaskLocked: options.isTaskLocked,
    onError: (error) =>
      context.uiBuilder.toast(context, {
        severity: 'error',
        message: errorMessage(error),
      }),
    onChanged: () => deps.invalidate(),
  })
  sessions.set(context, session)
  return session
}

export function ganttScheduleView<TNode>(
  context: UiContext,
  deps: UiViewDeps<TNode>,
  options: GanttScheduleViewOptions,
): TNode {
  const ui = context.uiBuilder
  const { factory } = ui
  const session = sessionFor(context, deps, options)
  const t = context.t

  const toolbar = deps.render('div', { class: 'opearBox' }, [
    factory.formField(
      { label: t('ganttLabel.timeScale') },
      {
        default: () =>
          factory.dropDownList({
            value: session.viewMode,
            options: TIME_SCALES.map((scale) => ({
              label: t(`ganttLabel.${scale}`),
              value: scale,
            })),
            onChange: (value) => session.setViewMode(value as UiGanttTimeScale),
          }),
      },
    ),
    factory.buttonGroup(
      {},
      {
        default: () => [
          factory.button({
            label: t('action.refresh'),
            onAction: () => void session.load(),
          }),
          factory.button({
            label: t('action.fit'),
            onAction: () => session.controller?.fitToProject(),
          }),
          factory.button({
            label: t('action.undo'),
            onAction: () => {
              if (options.undoController) session.controller?.undo()
              session.restore()
            },
          }),
        ],
      },
    ),
  ])

  const gantt = ui.buildGantt(context, {
    tasks: session.tasks,
    links: session.links,
    height: '70vh',
    viewMode: session.viewMode,
    loading: session.loading,
    allowRowReorder: options.allowRowReorder ?? false,
    columns: [
      { field: 'TaskName', header: t('ganttLabel.task') },
      { field: 'StartDate', header: t('ganttLabel.start') },
      { field: 'EndDate', header: t('ganttLabel.end') },
    ],
    onReady: (controller) => session.attach(controller),
    onTaskChange: (event) => session.changeTask(event),
    onLinkChange: (event) => session.changeLink(event),
    ...(options.allowRowReorder
      ? { onRowReorder: (task: UiGanttTask) => session.reorder(task) }
      : {}),
  })

  return deps.render(
    'div',
    { class: `ganttBoxWrapper ganttBoxWrapper--${options.variant}` },
    [toolbar, gantt],
  )
}
