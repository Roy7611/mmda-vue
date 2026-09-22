/*
 * 排产甘特的**业务会话**：取数 / 保存 / 撤销快照 / 视图粒度。
 *
 * 纯 TS，不 import 任何框架；生产排产（ProductionScheduleTasks）与项目排产
 * （ProjectScheduleTasks）共用一份，差异（仓储、action、映射函数、锁定判断）由
 * options 给。视图只做「壳 + 工具栏 + 调 controller」，状态住在这里。
 */
import type {
  ApiClient,
  UiGanttChangeEventArgs,
  UiGanttController,
  UiGanttLink,
  UiGanttTask,
  UiGanttTimeScale,
} from '@mmda/core'
import {
  ganttLinkToSavePayload,
  ganttTaskToSavePayload,
  rejectLockedTaskDrag,
} from './scheduleMapper'

export interface GanttScheduleData {
  tasks: UiGanttTask[]
  links: UiGanttLink[]
}

export interface GanttScheduleSessionOptions {
  apiClient: ApiClient
  repository: string
  service: string
  /** 取数 action：`getAllSchedule` / `getAllProjectSchedule`。 */
  loadAction: string
  /** 把接口返回的 list 映射成甘特数据（`mapSchedulePayload` / 项目版）。 */
  mapPayload: (list: unknown) => GanttScheduleData
  /** 该行是否禁止拖拽（拖了就回滚）。缺省用 `rejectLockedTaskDrag` 的反面。 */
  isTaskLocked?: (task: UiGanttTask) => boolean
  /** 出错提示（视图给 toast）。 */
  onError: (error: unknown) => void
  /** 状态变了 → 请宿主重跑视图函数。 */
  onChanged: () => void
}

/** 列表接口返回 `{ list }` 或裸数组都收。 */
function listOf(raw: unknown): unknown {
  return (raw as { list?: unknown } | undefined)?.list ?? raw
}

function copyTasks(tasks: UiGanttTask[]): UiGanttTask[] {
  return tasks.map((task) => ({ ...task }))
}

function copyLinks(links: UiGanttLink[]): UiGanttLink[] {
  return links.map((link) => ({ ...link }))
}

export class GanttScheduleSession {
  tasks: UiGanttTask[] = []
  links: UiGanttLink[] = []
  loading = true
  viewMode: UiGanttTimeScale = 'week'
  controller: UiGanttController | undefined

  private readonly options: GanttScheduleSessionOptions
  private snapshot: GanttScheduleData = { tasks: [], links: [] }
  private started = false

  constructor(options: GanttScheduleSessionOptions) {
    this.options = options
  }

  /** 甘特挂上来了：记住 controller，并（只做一次）拉数据。 */
  attach(controller: UiGanttController): void {
    this.controller = controller
    if (this.started) return
    this.started = true
    void this.load()
  }

  async load(): Promise<void> {
    this.loading = true
    this.options.onChanged()
    try {
      const raw = await this.options.apiClient.getAll(this.actionOf(this.options.loadAction))
      const mapped = this.options.mapPayload(listOf(raw))
      this.tasks = mapped.tasks
      this.links = mapped.links
      this.snapshot = { tasks: copyTasks(mapped.tasks), links: copyLinks(mapped.links) }
      this.controller?.refresh(this.tasks, this.links)
    } catch (error) {
      this.options.onError(error)
    } finally {
      this.loading = false
      this.options.onChanged()
    }
  }

  /** 撤销：回到最近一次取数的快照。 */
  restore(): void {
    this.tasks = copyTasks(this.snapshot.tasks)
    this.links = copyLinks(this.snapshot.links)
    this.controller?.refresh(this.tasks, this.links)
    this.options.onChanged()
  }

  setViewMode(mode: UiGanttTimeScale): void {
    this.viewMode = mode
    this.controller?.setViewMode(mode)
    this.options.onChanged()
  }

  /** 拖动/改期：保存成功就整体重取，失败回滚。 */
  async changeTask(event?: UiGanttChangeEventArgs): Promise<boolean> {
    const task = event?.task
    if (!task || this.isLocked(task)) {
      this.restore()
      return false
    }
    return this.save('saveAndGetAll', ganttTaskToSavePayload(task), true)
  }

  /** 连线：保存成功就整体重取，失败回滚。 */
  async changeLink(event?: UiGanttChangeEventArgs): Promise<boolean> {
    const link = event?.link
    if (!link) {
      this.restore()
      return false
    }
    return this.save('saveLinkAndGet', ganttLinkToSavePayload(link), true)
  }

  /** 行序调整：只保存，不重取。 */
  async reorder(task?: UiGanttTask): Promise<boolean> {
    if (!task) return false
    return this.save('saveAndGetAll', ganttTaskToSavePayload(task), false)
  }

  private actionOf(action: string) {
    return {
      action,
      repository: this.options.repository,
      service: this.options.service,
    }
  }

  private isLocked(task: UiGanttTask): boolean {
    const isLocked = this.options.isTaskLocked
    return isLocked ? isLocked(task) : !rejectLockedTaskDrag(task)
  }

  private async save(action: string, body: unknown, reload: boolean): Promise<boolean> {
    try {
      await this.options.apiClient.doAction(this.actionOf(action), body)
      if (reload) await this.load()
      return true
    } catch (error) {
      this.options.onError(error)
      this.restore()
      return false
    }
  }
}
