import {
  MetaUiFieldFrozen,
  compareListColumns,
  ensureListFieldVisibleWhenFrozen,
  isListFrozen,
  toEntityQuery,
  type ListSettingsField,
  type MetaUi,
  type MetaUiField,
  type MetaUiFilter,
} from "@mmda/core";
import type { UiViewContext } from "./ui_context";

export const SYSTEM_LIST_COLUMNS = new Set([
  "rowNum",
  "__mmdaActions",
]);

const persistTimers = new WeakMap<object, ReturnType<typeof setTimeout>>();

export function listServiceName(context: UiViewContext<any>) {
  const logic = context.logic as
    | { apiService?: string; apiClient?: { config?: { service?: string } } }
    | undefined;
  return logic?.apiService ?? logic?.apiClient?.config?.service;
}

export function bumpListLayout(context: UiViewContext<any>) {
  context.metaui.getListedFields(true);
  context.listLayoutRev.value += 1;
}

export function collectListSettingsFields(metaui: MetaUi): ListSettingsField[] {
  return metaui.getListLayoutFields().map((field) => ({
    fieldName: field.fieldName,
    listSize: field.listSize,
    listed: field.listed,
    frozen: field.frozen,
    listPos: field.listPos ?? field.fieldIdx,
  }));
}

export function applyListSettingsFields(
  metaui: MetaUi,
  fields: ListSettingsField[],
) {
  for (const patch of fields) {
    const field = metaui.getField(patch.fieldName);
    if (!field) continue;
    if (patch.listSize != null) field.listSize = patch.listSize;
    if (patch.listed != null) field.listed = patch.listed;
    if (patch.frozen != null) {
      field.frozen = normalizeFrozen(patch.frozen);
    }
    if (patch.listPos != null) field.listPos = patch.listPos;
    ensureListFieldVisibleWhenFrozen(field);
  }
  metaui.getListedFields(true);
}

export function normalizeFrozen(value?: string | MetaUiFieldFrozen) {
  const band = String(value ?? "").toLowerCase();
  if (band === MetaUiFieldFrozen.Left || band === "left") {
    return MetaUiFieldFrozen.Left;
  }
  if (band === MetaUiFieldFrozen.Right || band === "right") {
    return MetaUiFieldFrozen.Right;
  }
  return MetaUiFieldFrozen.None;
}

export function syncQuickFiltersToMeta(context: UiViewContext<any>) {
  for (const filter of context.filters) {
    const selected = new Set(filter.selectedConditions.value);
    for (const condition of filter.metaUiFilter.filterConditions ?? []) {
      condition.active = selected.has(condition);
    }
  }
}

export async function persistListPack(context: UiViewContext<any>) {
  const logic = context.logic as
    | {
        repository?: string;
        meta?: { metaui?: MetaUi; filters?: MetaUiFilter[] };
        metaUiService?: {
          updateForCache: (
            repository: string,
            pack: any,
            service?: string,
          ) => Promise<void>;
        };
      }
    | undefined;
  if (!logic?.repository || !logic.meta?.metaui || !logic.metaUiService) return;
  syncQuickFiltersToMeta(context);
  try {
    await logic.metaUiService.updateForCache(
      logic.repository,
      {
        ...logic.meta,
        metaui: context.metaui,
        lastQuery: toEntityQuery(context.searchParam),
      },
      listServiceName(context),
    );
  } catch {
    await context.app?.ui?.toast?.(context as any, {
      severity: "error",
      detail: context.t("listSettings.cacheFailed"),
    });
  }
}

export function schedulePersistListPack(
  context: UiViewContext<any>,
  delay = 400,
) {
  const previous = persistTimers.get(context);
  if (previous) clearTimeout(previous);
  persistTimers.set(
    context,
    setTimeout(() => {
      persistTimers.delete(context);
      void persistListPack(context);
    }, delay),
  );
}

export function snapshotListLayoutRows(metaui: MetaUi) {
  return metaui.getListLayoutFields().map((field, index) => ({
    fieldName: field.fieldName,
    displayLabel: field.displayLabel,
    listed: isListFrozen(field.frozen) ? true : field.listed !== false && !!field.listed,
    frozen: normalizeFrozen(field.frozen),
    listPos: field.listPos ?? field.fieldIdx ?? index,
    listSize: field.listSize,
  }));
}

export function reindexListPos(
  rows: Array<{ frozen: MetaUiFieldFrozen; listPos: number }>,
) {
  const left = rows
    .filter((row) => row.frozen === MetaUiFieldFrozen.Left)
    .sort((a, b) => a.listPos - b.listPos);
  const free = rows
    .filter((row) => row.frozen === MetaUiFieldFrozen.None)
    .sort((a, b) => a.listPos - b.listPos);
  const right = rows
    .filter((row) => row.frozen === MetaUiFieldFrozen.Right)
    .sort((a, b) => a.listPos - b.listPos);
  ;[...left, ...free, ...right].forEach((row, index) => {
    row.listPos = index;
  });
}

export function layoutRowsByBand<T extends { frozen: MetaUiFieldFrozen; listPos: number }>(
  rows: T[],
) {
  return [...rows].sort(compareListColumns as (a: T, b: T) => number);
}

export function isPersistableListColumn(fieldName?: string) {
  return Boolean(fieldName) && !SYSTEM_LIST_COLUMNS.has(fieldName!);
}

export function gridFreezeOf(field: MetaUiField) {
  const frozen = normalizeFrozen(field.frozen);
  if (frozen === MetaUiFieldFrozen.Left) return "Left";
  if (frozen === MetaUiFieldFrozen.Right) return "Right";
  return undefined;
}
