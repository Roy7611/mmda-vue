import {
  MetaUiFieldAlignment,
  MetaUiFieldFrozen,
  SqlDataType,
  compareListColumns,
  ensureListFieldVisibleWhenFrozen,
  isListFrozen,
  type TableColumnSettings,
  type MetaUi,
  type MetaUiField,
  type MetaUiFilter,
  joinListRelationName,
} from "@mmda/core";
import type { VuiContext } from "../../contexts/vue_ui_context";
import { indexTableMetaUi } from "./join_list_mode";

export const SYSTEM_LIST_COLUMNS = new Set([
  "rowNum",
  "__mmdaActions",
]);

const persistTimers = new WeakMap<object, ReturnType<typeof setTimeout>>();

export function listServiceName(context: VuiContext<any>) {
  const logic = context.logic as
    | { apiService?: string; serviceName?: string }
    | undefined;
  return logic?.apiService ?? logic?.serviceName;
}

export function bumpListLayout(context: VuiContext<any>) {
  indexTableMetaUi(context).getListedFields(true);
  context.listLayoutRev.value += 1;
}

export function collectTableColumnSettings(metaUi: MetaUi): TableColumnSettings[] {
  return metaUi.getListLayoutFields().map((field) => ({
    fieldName: field.fieldName,
    listSize: field.listSize,
    listed: field.listed,
    frozen: field.frozen,
    listPos: field.listPos ?? field.fieldIdx,
    align: field.align,
  }));
}

export function applyTableColumnSettings(
  metaUi: MetaUi,
  fields: TableColumnSettings[],
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

export function syncQuickFiltersToMeta(context: VuiContext<any>) {
  for (const filter of context.filters) {
    const selected = new Set(filter.selectedConditions.value);
    for (const condition of filter.metaUiFilter.filterConditions ?? []) {
      condition.active = selected.has(condition);
    }
  }
}

function snapshotMeta(meta: MetaUi) {
  return JSON.parse(
    JSON.stringify(meta, (key, value) => {
      if (typeof value === "function") return undefined;
      if (String(key).startsWith("_")) return undefined;
      if (key === "reference") return undefined;
      return value;
    }),
  );
}

export async function persistListPack(context: VuiContext<any>) {
  const logic = context.logic as
    | {
        repository?: string;
        metaUi?: MetaUi;
        viewUi?: MetaUi;
        metaUiService?: {
          updateToCache: (
            repository: string,
            metaUi: MetaUi,
            service?: string,
          ) => Promise<void>;
          localDb?: { put: (key: string, value: unknown) => Promise<unknown> };
        };
      }
    | undefined;
  if (!logic?.repository || !logic.metaUi || !logic.metaUiService) return;
  try {
    if (context.joinListMode && logic.viewUi) {
      const relationName = joinListRelationName(logic.metaUi);
      if (relationName && logic.metaUiService.localDb) {
        await logic.metaUiService.localDb.put(
          `meta/${logic.repository}/${relationName}View`,
          snapshotMeta(logic.viewUi),
        );
      }
    } else {
      await logic.metaUiService.updateToCache(
        logic.repository,
        context.metaUi,
        listServiceName(context),
      );
    }
  } catch {
    await context.app?.ui?.toast?.(context as any, {
      severity: "error",
      message: context.t("tableSettings.cacheFailed"),
    });
  }
}

export function schedulePersistListPack(
  context: VuiContext<any>,
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
