import {
  MetaUiFieldFrozen,
  type MetaUiField,
  type TableColumnSettings,
} from "@mmda/core";

/** 系统列不参与列表布局持久化。 */
export const SYSTEM_LIST_COLUMNS = new Set(["rowNum", "__mmdaActions"]);

export function isPersistableListColumn(field?: string): boolean {
  if (!field) return false;
  return !SYSTEM_LIST_COLUMNS.has(field);
}

/** EJ2 autoFit 会把 width 写成 `180px`；Number('180px') 是 NaN，listSize 就写不回去。 */
export function parseGridColumnWidth(width: unknown): number | undefined {
  if (width == null || width === "") return undefined;
  const value = typeof width === "number" ? width : parseFloat(String(width));
  return Number.isFinite(value) && value > 0 ? Math.round(value) : undefined;
}

export function collectGridColumnSettings(
  ej2Grid: any,
): TableColumnSettings[] {
  const columns = (ej2Grid.getColumns?.() ?? []).filter(
    (column: any) =>
      isPersistableListColumn(column.field) && column.type !== "checkbox",
  );
  return columns.map((column: any, index: number) => {
    const freeze = String(column.freeze ?? "");
    return {
      fieldName: column.field,
      listSize: parseGridColumnWidth(column.width),
      listed: column.visible !== false,
      frozen:
        freeze === "Left"
          ? MetaUiFieldFrozen.Left
          : freeze === "Right"
            ? MetaUiFieldFrozen.Right
            : MetaUiFieldFrozen.None,
      listPos: index,
    };
  });
}

/** MetaUiField.frozen → EJ2 Grid freeze 方向。 */
export function columnFreezeOf(
  field: Pick<MetaUiField, "frozen">,
): string {
  const freeze = String(field.frozen ?? "");
  if (freeze === MetaUiFieldFrozen.Left) return "Left";
  if (freeze === MetaUiFieldFrozen.Right) return "Right";
  return "";
}
