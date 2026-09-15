import {
  MetaUiFieldAlignment,
  MetaUiFieldFrozen,
  SqlDataType,
  compareListColumns,
  ensureListFieldVisibleWhenFrozen,
  isListFrozen,
  type ListSettingsField,
  type MetaUi,
  type MetaUiField,
  type MetaUiFilter,
} from "@mmda/core";
import type { VueUiContext } from "../../contexts/vue_ui_context";
import { indexTableMetaUi } from "./join_list_mode";

export const SYSTEM_LIST_COLUMNS = new Set([
  "rowNum",
  "__mmdaActions",
]);

const persistTimers = new WeakMap<object, ReturnType<typeof setTimeout>>();

export function listServiceName(context: VueUiContext<any>) {
  const logic = context.logic as
    | { apiService?: string; serviceName?: string }
    | undefined;
  return logic?.apiService ?? logic?.serviceName;
}

export function bumpListLayout(context: VueUiContext<any>) {
  indexTableMetaUi(context).getListedFields(true);
  context.listLayoutRev.value += 1;
}

export function collectListSettingsFields(metaUi: MetaUi): ListSettingsField[] {
  return metaUi.getListLayoutFields().map((field) => ({
    fieldName: field.fieldName,
    listSize: field.listSize,
    listed: field.listed,
    frozen: field.frozen,
    listPos: field.listPos ?? field.fieldIdx,
    align: field.align,
  }));
}

export function applyListSettingsFields(
  metaUi: MetaUi,
  fields: ListSettingsField[],
) {
  for (const patch of fields) {
    const field = metaUi.getField(patch.fieldName);
    if (!field) continue;
    if (patch.listSize != null) field.listSize = patch.listSize;
    if (patch.listed != null) field.listed = patch.listed;
    if (patch.frozen != null) {
      field.frozen = normalizeFrozen(patch.frozen);
    }
    if (patch.listPos != null) field.listPos = patch.listPos;
    if (patch.align != null) field.align = normalizeAlign(patch.align);
    ensureListFieldVisibleWhenFrozen(field);
  }
  metaUi.getListedFields(true);
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

export function normalizeAlign(
  value?: string | MetaUiFieldAlignment,
): MetaUiFieldAlignment {
  const align = String(value ?? "").toUpperCase();
  if (align === MetaUiFieldAlignment.RIGHT || align === "END") {
    return MetaUiFieldAlignment.RIGHT;
  }
  if (align === MetaUiFieldAlignment.CENTER) {
    return MetaUiFieldAlignment.CENTER;
  }
  return MetaUiFieldAlignment.LEFT;
}

/** 有配置用配置；START/END 收成左/右。缺省与网格一致：数值右、其它左。 */
export function listFieldAlign(field: MetaUiField): MetaUiFieldAlignment {
  if (field.align) return normalizeAlign(field.align);
  if (
    field.reference?.isEnum ||
    field.reference?.isRef ||
    field.reference?.hasOne
  ) {
    return MetaUiFieldAlignment.LEFT;
  }
  if (SqlDataType.isNum(field.dataType)) return MetaUiFieldAlignment.RIGHT;
  return MetaUiFieldAlignment.LEFT;
}

export function syncQuickFiltersToMeta(context: VueUiContext<any>) {
  for (const filter of context.filters) {
    const selected = new Set(filter.selectedConditions.value);
    for (const condition of filter.metaUiFilter.filterConditions ?? []) {
      condition.active = selected.has(condition);
    }
  }
}

export async function persistListPack(context: VueUiContext<any>) {
  const logic = context.logic as
    | {
        repository?: string;
        meta?: { metaUi?: MetaUi; metaVui?: MetaUi };
        metaUiService?: {
          updateForCache: (
            repository: string,
            pack: any,
            service?: string,
          ) => Promise<void>;
        };
      }
    | undefined;
  if (!logic?.repository || !logic.meta?.metaUi || !logic.metaUiService) return;
  try {
    await logic.metaUiService.updateForCache(
      logic.repository,
      {
        metaUi: context.metaUi,
        ...(logic.meta.metaVui ? { metaVui: logic.meta.metaVui } : {}),
      },
      listServiceName(context),
    );
  } catch {
    await context.app?.ui?.toast?.(context as any, {
      severity: "error",
      message: context.t("tableSettings.cacheFailed"),
    });
  }
}

export function schedulePersistListPack(
  context: VueUiContext<any>,
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

export function snapshotListLayoutRows(metaUi: MetaUi) {
  return metaUi.getListLayoutFields().map((field, index) => ({
    fieldName: field.fieldName,
    displayLabel: field.displayLabel,
    listed: isListFrozen(field.frozen) ? true : field.listed !== false && !!field.listed,
    frozen: normalizeFrozen(field.frozen),
    listPos: field.listPos ?? field.fieldIdx ?? index,
    listSize: field.listSize,
    align: listFieldAlign(field),
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
  return [...rows].sort(
    compareListColumns as unknown as (a: T, b: T) => number,
  );
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
