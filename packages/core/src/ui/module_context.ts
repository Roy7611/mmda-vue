import type { Entity } from '../models/entity'
import type { Pager, Pagination } from '../models/pagination'
import type { UiContext } from './context'
import type { UiMessageProps } from './factory/message'
import type { UiIndexTableHost } from './builder/list_view'

/**
 * 模块工作区：保活 Index 与 One 视图之间的列表同步。
 *
 * 框架无关：实现侧持有 `UiContext`，读写 `model` / `searchParam` / `currentItem` /
 * `selectedItems` / `indexTableHost` 全是 core 契约。vui / rui 共用同一个工厂。
 */
export interface ModuleContext {
  /** 换 repository 时清空（父组件可能被路由复用）。 */
  reset(): void
  registerIndex(context: UiContext): void
  unregisterIndex(context: UiContext): void
  /**
   * 保活的 Index 会话（叠层揭开时仍活着）。
   * 搜索页叠层读写它的 `searchParam` —— 草稿住搜索会话，确认才落列表会话。
   */
  indexContext(): UiContext | null
  /** 进 Create：currentIndex=-1，currentItem=null。 */
  beginCreate(): void
  /** 进 details/edit：记住当前行。 */
  setCurrent(row: Entity, index: number): void
  /** Create save：插第 0 行并设为 current。 */
  appendNewRow(entity: Record<string, unknown>): void
  /** Edit save / details 返回：写 currentItem（含 doAction 结果）。 */
  applyCurrentRow(entity: Record<string, unknown>): void
  /** deleteById 成功：从缓存列表 remove。 */
  removeById(id: string): void
  /** Edit/Create → Details：顶栏 Message 一次消费。 */
  setPendingPageNotice(notice: UiMessageProps | null): void
  consumePendingPageNotice(): UiMessageProps | null
  consumeNeedsSearch(): boolean
}

function primaryKeyOf(context: UiContext): string {
  return context.metaUi?.primaryKey ?? 'id'
}

function listRows(context: UiContext): Entity[] | null {
  return Array.isArray(context.model) ? (context.model as Entity[]) : null
}

function listPager(context: UiContext): (Pager & Pagination) | undefined {
  return context.searchParam?.pager as (Pager & Pagination) | undefined
}

function applyToHost(
  listHost: UiIndexTableHost | undefined,
  kind: 'applyRow' | 'insertAtZero' | 'remove',
  payload: Record<string, unknown> | string,
) {
  if (!listHost) return
  if (kind === 'applyRow') {
    listHost.applyRow(payload as Record<string, unknown>)
  } else if (kind === 'insertAtZero') {
    listHost.insertAtZero(payload as Record<string, unknown>)
  } else {
    listHost.applyRemove(payload as string)
  }
}

export function createModuleContext(): ModuleContext {
  let indexContext: UiContext | null = null
  let needsSearch = false
  let pendingPageNotice: UiMessageProps | null = null

  return {
    reset() {
      indexContext = null
      needsSearch = false
      pendingPageNotice = null
    },
    registerIndex(context) {
      indexContext = context
    },
    unregisterIndex(context) {
      if (indexContext === context) indexContext = null
    },
    indexContext() {
      return indexContext
    },
    beginCreate() {
      const context = indexContext
      if (!context) return
      context.currentItem = null
      context.currentIndex = -1
    },
    setCurrent(row, index) {
      const context = indexContext
      if (!context) return
      context.currentItem = row as Entity
      context.currentIndex = index
    },
    appendNewRow(entity) {
      const context = indexContext
      if (!context?.many) return
      const rows = listRows(context)
      if (!rows) return
      const pager = listPager(context)
      const key = primaryKeyOf(context)
      const id = (entity as Record<string, unknown>)[key] ?? entity.id
      if (id == null || String(id) === '') return
      const idStr = String(id)
      // 已在列表（重复 save）则当改行
      const existing = rows.find(
        (item) =>
          String(
            (item as Record<string, unknown>)[key] ?? item.id,
          ) === idStr,
      )
      if (existing) {
        const rowNum = existing.rowNum
        Object.assign(existing, entity)
        existing.rowNum = rowNum
        context.currentItem = existing
        context.currentIndex = rows.indexOf(existing)
        applyToHost(
          context.indexTableHost,
          'applyRow',
          existing as Record<string, unknown>,
        )
        return
      }
      const from =
        Number(pager?.from) ||
        (Number(pager?.pageNo ?? 1) - 1) *
          Number(pager?.pageSize ?? rows.length) +
          1
      rows.unshift(entity as Entity)
      for (let i = 0; i < rows.length; i++) {
        rows[i]!.rowNum = String(from + i)
      }
      if (pager) {
        const total = Number(pager.recordCount ?? 0)
        pager.recordCount = total + 1
      }
      context.currentItem = rows[0] as Entity
      context.currentIndex = 0
      applyToHost(
        context.indexTableHost,
        'insertAtZero',
        rows[0] as Record<string, unknown>,
      )
    },
    applyCurrentRow(entity) {
      const context = indexContext
      if (!context?.many) return
      const current = context.currentItem as Record<string, unknown> | null
      if (current == null || (context.currentIndex ?? -1) < 0) return
      const rowNum = current.rowNum
      Object.assign(current, entity)
      current.rowNum = rowNum
      applyToHost(context.indexTableHost, 'applyRow', current)
    },
    removeById(id) {
      const context = indexContext
      if (!context?.many) return
      const rows = listRows(context)
      if (!rows) return
      const pager = listPager(context)
      const key = primaryKeyOf(context)
      const idStr = String(id)
      const idx = rows.findIndex(
        (item) =>
          String(
            (item as Record<string, unknown>)[key] ?? item.id,
          ) === idStr,
      )
      const selected = (context.selectedItems ?? []) as Entity[]
      context.selectedItems = selected.filter(
        (item) =>
          String(
            (item as Record<string, unknown>)[key] ?? item.id,
          ) !== idStr,
      ) as typeof context.selectedItems

      if (
        context.currentItem &&
        String(
          (context.currentItem as Record<string, unknown>)[key] ??
            (context.currentItem as Entity).id,
        ) === idStr
      ) {
        context.currentItem = null
        context.currentIndex = -1
      }

      const pageSize = Number(pager?.pageSize ?? rows.length)
      const pageNo = Number(pager?.pageNo ?? 1)
      const total = Number(pager?.recordCount ?? rows.length)

      if (idx >= 0) {
        rows.splice(idx, 1)
        if (pager) pager.recordCount = Math.max(0, total - 1)
        if (rows.length === 0 && pageNo > 1) {
          if (pager) pager.pageNo = pageNo - 1
          needsSearch = true
        } else if (
          rows.length < pageSize &&
          (pager?.recordCount ?? 0) >
            (pageNo - 1) * pageSize + rows.length
        ) {
          needsSearch = true
        }
        applyToHost(context.indexTableHost, 'remove', idStr)
        return
      }
      if (pager && total > 0) pager.recordCount = total - 1
    },
    consumeNeedsSearch() {
      if (!needsSearch) return false
      needsSearch = false
      return true
    },
    setPendingPageNotice(notice) {
      pendingPageNotice = notice
    },
    consumePendingPageNotice() {
      const notice = pendingPageNotice
      pendingPageNotice = null
      return notice
    },
  }
}
