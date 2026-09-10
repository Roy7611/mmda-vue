import type { Entity, PagedList, UiMessageProps } from "@mmda/core";
import type { InjectionKey } from "vue";
import type { VueUiContext } from "./vue_ui_context";
import type { UiIndexTableHost } from "../ui/factory/list";

export type IndexModelOp =
  | { kind: "applyRow"; entity: Record<string, unknown> }
  | { kind: "insertAtZero"; entity: Record<string, unknown> }
  | { kind: "remove"; id: string };

/** 模块工作区：Index KeepAlive 与 One 视图之间的列表同步。 */
export interface VueModuleContext {
  /** 换 repository 时清空（父组件可能被路由复用）。 */
  reset(): void;
  registerIndex(context: VueUiContext): void;
  unregisterIndex(context: VueUiContext): void;
  /** 进 Create：currentIndex=-1，currentItem=null。 */
  beginCreate(): void;
  /** 进 details/edit：记住当前行。 */
  setCurrent(row: Entity, index: number): void;
  /** Create save：插第 0 行并设为 current。 */
  insertAtZeroFromSave(entity: Record<string, unknown>): void;
  /** Edit save / details 返回：写 currentItem（含 doAction 结果）。 */
  applyCurrentRow(entity: Record<string, unknown>): void;
  /** deleteById 成功：从缓存列表 remove。 */
  removeById(id: string): void;
  /** Edit/Create → Details：顶栏 Message 一次消费。 */
  setPendingPageNotice(notice: UiMessageProps | null): void;
  consumePendingPageNotice(): UiMessageProps | null;
  consumeNeedsSearch(): boolean;
  flushVisual(): void;
  /** 离开 index（KeepAlive deactivate）。 */
  saveScroll(): void;
  /** 回到 index：按 currentIndex 滚到可见并选中。 */
  revealCurrent(): void;
}

export const MODULE_CONTEXT_KEY = Symbol(
  "VueModuleContext",
) as InjectionKey<VueModuleContext>;

function primaryKeyOf(context: VueUiContext): string {
  return context.metaUi?.primaryKey ?? "id";
}

function listModel(context: VueUiContext): PagedList<Entity> | null {
  const model = context.model as PagedList<Entity> | undefined;
  if (!model || !Array.isArray(model.list) || !model.pagination) return null;
  return model;
}

function enqueueOrApply(
  pending: IndexModelOp[],
  activated: boolean,
  listHost: UiIndexTableHost | undefined,
  op: IndexModelOp,
) {
  if (activated && listHost) {
    applyIndexModelOp(listHost, op);
    return;
  }
  pending.push(op);
}

function applyIndexModelOp(listHost: UiIndexTableHost, op: IndexModelOp) {
  if (op.kind === "applyRow") listHost.applyRow(op.entity);
  else if (op.kind === "insertAtZero") listHost.insertAtZero(op.entity);
  else listHost.applyRemove(op.id);
}

export function createModuleContext(): VueModuleContext {
  let indexContext: VueUiContext | null = null;
  let needsSearch = false;
  let activated = true;
  let scrollToTop = false;
  let pendingPageNotice: UiMessageProps | null = null;
  const pending: IndexModelOp[] = [];

  return {
    reset() {
      indexContext = null;
      needsSearch = false;
      activated = true;
      scrollToTop = false;
      pendingPageNotice = null;
      pending.length = 0;
    },
    registerIndex(context) {
      indexContext = context;
      activated = true;
    },
    unregisterIndex(context) {
      if (indexContext === context) indexContext = null;
    },
    beginCreate() {
      const context = indexContext;
      if (!context) return;
      context.currentItem = null;
      context.currentIndex = -1;
    },
    setCurrent(row, index) {
      const context = indexContext;
      if (!context) return;
      context.currentItem = row;
      context.currentIndex = index;
    },
    insertAtZeroFromSave(entity) {
      const context = indexContext;
      if (!context?.many) return;
      const paged = listModel(context);
      if (!paged) return;
      const key = primaryKeyOf(context);
      const id = entity[key] ?? entity.id;
      if (id == null || String(id) === "") return;
      const idStr = String(id);
      // 已在列表（重复 save）则当改行
      const existing = paged.list.find(
        (item) =>
          String((item as Record<string, unknown>)[key] ?? item.id) === idStr,
      );
      if (existing) {
        const rowNum = (existing as Entity).rowNum;
        Object.assign(existing, entity);
        (existing as Entity).rowNum = rowNum;
        context.currentItem = existing;
        context.currentIndex = paged.list.indexOf(existing);
        enqueueOrApply(pending, activated, context.indexTableHost, {
          kind: "applyRow",
          entity: existing as Record<string, unknown>,
        });
        return;
      }
      const from =
        Number(paged.pagination.from) ||
        (Number(paged.pagination.pageNo ?? 1) - 1) *
          Number(paged.pagination.pageSize ?? paged.list.length) +
          1;
      paged.list.unshift(entity as Entity);
      for (let i = 0; i < paged.list.length; i++) {
        (paged.list[i] as Entity).rowNum = String(from + i);
      }
      const total = Number(paged.pagination.recordCount ?? 0);
      paged.pagination.recordCount = total + 1;
      context.currentItem = paged.list[0] as Entity;
      context.currentIndex = 0;
      scrollToTop = true;
      enqueueOrApply(pending, activated, context.indexTableHost, {
        kind: "insertAtZero",
        entity: paged.list[0] as Record<string, unknown>,
      });
    },
    applyCurrentRow(entity) {
      const context = indexContext;
      if (!context?.many) return;
      const current = context.currentItem as Record<string, unknown> | null;
      if (current == null || context.currentIndex < 0) return;
      const rowNum = current.rowNum;
      Object.assign(current, entity);
      current.rowNum = rowNum;
      enqueueOrApply(pending, activated, context.indexTableHost, {
        kind: "applyRow",
        entity: current,
      });
    },
    removeById(id) {
      const context = indexContext;
      if (!context?.many) return;
      const paged = listModel(context);
      if (!paged) return;
      const key = primaryKeyOf(context);
      const idStr = String(id);
      const idx = paged.list.findIndex(
        (item) =>
          String((item as Record<string, unknown>)[key] ?? item.id) === idStr,
      );
      const selected = (context.selectedItems ?? []) as Entity[];
      context.selectedItems = selected.filter(
        (item) =>
          String((item as Record<string, unknown>)[key] ?? item.id) !== idStr,
      ) as typeof context.selectedItems;

      if (
        context.currentItem &&
        String(
          (context.currentItem as Record<string, unknown>)[key] ??
            (context.currentItem as Entity).id,
        ) === idStr
      ) {
        context.currentItem = null;
        context.currentIndex = -1;
      }

      const pageSize = Number(paged.pagination.pageSize ?? paged.list.length);
      const pageNo = Number(paged.pagination.pageNo ?? 1);
      const total = Number(paged.pagination.recordCount ?? paged.list.length);

      if (idx >= 0) {
        paged.list.splice(idx, 1);
        paged.pagination.recordCount = Math.max(0, total - 1);
        if (paged.list.length === 0 && pageNo > 1) {
          paged.pagination.pageNo = pageNo - 1;
          needsSearch = true;
        } else if (
          paged.list.length < pageSize &&
          paged.pagination.recordCount >
            (pageNo - 1) * pageSize + paged.list.length
        ) {
          needsSearch = true;
        }
        enqueueOrApply(pending, activated, context.indexTableHost, {
          kind: "remove",
          id: idStr,
        });
        return;
      }
      if (total > 0) paged.pagination.recordCount = total - 1;
    },
    consumeNeedsSearch() {
      if (!needsSearch) return false;
      needsSearch = false;
      return true;
    },
    setPendingPageNotice(notice) {
      pendingPageNotice = notice;
    },
    consumePendingPageNotice() {
      const notice = pendingPageNotice;
      pendingPageNotice = null;
      return notice;
    },
    flushVisual() {
      activated = true;
      const host = indexContext?.indexTableHost;
      if (!host) {
        pending.length = 0;
        return;
      }
      for (const op of pending.splice(0)) applyIndexModelOp(host, op);
    },
    saveScroll() {
      activated = false;
    },
    revealCurrent() {
      const context = indexContext;
      const host = context?.indexTableHost;
      if (!host) return;
      if (scrollToTop) {
        scrollToTop = false;
        host.revealIndex(0);
        return;
      }
      const idx = Number(context?.currentIndex ?? -1);
      if (idx >= 0) host.revealIndex(idx);
    },
  };
}

const moduleContexts = new WeakMap<object, VueModuleContext>();

/** 在 EntityView open 时把工作区 VueModuleContext 挂到 context，供 mixin 使用（非 setup 无法 inject）。 */
export function bindModuleContext(
  context: object,
  module: VueModuleContext | null | undefined,
) {
  if (module) moduleContexts.set(context, module);
  else moduleContexts.delete(context);
}

export function getModuleContext(
  context: object,
): VueModuleContext | undefined {
  return moduleContexts.get(context);
}
