import { defineComponent, h, nextTick, ref } from "vue";
import { ensureListFieldVisibleWhenFrozen, isListFrozen, MetaUiFieldFrozen, type MetaUi } from "@mmda/core";
import { isPersistableListColumn, persistListPack, type UiViewContext } from "@mmda/vui"
import { GridComponent } from "@syncfusion/ej2-vue-grids";
import { SF_GRID_MODULES } from "./grid_inject";

export { SfGridLoadingHost } from "../components/SfLoadingHost";

/**
 * EJ2 GridComponent 外壳（provide 注入模块）。
 * 契约层控件见 `components/SfGrid.ts`；本宿主供 factory.table / SfGrid 内部使用。
 */
export const SfGridHost = defineComponent({
  name: "SfGridHost",
  inheritAttrs: false,
  provide: {
    grid: SF_GRID_MODULES,
  },
  setup(_, { attrs, slots, expose }) {
    const inner = ref(null);
    expose({
      get ej2Instances() {
        return inner.value?.ej2Instances ?? inner.value;
      },
    });
    return () => h(GridComponent as any, { ...attrs, ref: inner }, slots);
  },
});

/** @deprecated 使用 SfGridHost；保留别名以免旧 import 断裂 */
export const SfGrid = SfGridHost;

/** EJ2 autoFit 会把 width 写成 `180px`；Number('180px') 是 NaN，listSize 就写不回去。 */
export const parseGridColumnWidth = (width: unknown): number | undefined => {
  if (width == null || width === "") return undefined;
  const value = typeof width === "number" ? width : parseFloat(String(width));
  return Number.isFinite(value) && value > 0 ? Math.round(value) : undefined;
};

export const syncMetaUiFromGridColumns = (ej2Grid: any, metaUi: MetaUi) => {
  const columns = (ej2Grid.getColumns?.() ?? []).filter(
    (column: any) =>
      isPersistableListColumn(column.field) && column.type !== "checkbox",
  );
  columns.forEach((column: any, index: number) => {
    const field = metaUi.getField(column.field);
    if (!field) return;
    field.listPos = index;
    const width = parseGridColumnWidth(column.width);
    if (width != null) field.listSize = width;
    const freeze = String(column.freeze ?? "");
    if (freeze === "Left") field.frozen = MetaUiFieldFrozen.Left;
    else if (freeze === "Right") field.frozen = MetaUiFieldFrozen.Right;
    else field.frozen = MetaUiFieldFrozen.None;
    ensureListFieldVisibleWhenFrozen(field);
    if (!isListFrozen(field.frozen)) {
      field.listed = column.visible !== false;
    }
  });
  metaUi.getListedFields(true);
};

export const waitForGridPaint = async () => {
  await nextTick();
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
};

/** 工具栏「自动列宽」：EJ2 autoFitColumns + 回写 metaUi.listSize 并缓存。 */
export async function autoFitSyncfusionListGrid(context: UiViewContext<any>) {
  if (typeof document === "undefined") return;
  const metaUi = context.metaUi;
  if (!metaUi) return;
  const element = document.querySelector(".e-grid.mmda-table");
  const ej2Grid = (element as any)?.ej2_instances?.[0];
  if (!ej2Grid) return;

  const fields = (ej2Grid.getColumns?.() ?? [])
    .filter(
      (column: any) =>
        column.visible !== false &&
        isPersistableListColumn(column.field) &&
        column.type !== "checkbox",
    )
    .map((column: any) => column.field);

  try {
    if (fields.length) ej2Grid.autoFitColumns(fields);
    else ej2Grid.autoFitColumns();
  } catch {
    /* ignore */
  }

  await waitForGridPaint();
  syncMetaUiFromGridColumns(ej2Grid, metaUi);
  await persistListPack(context);
}
