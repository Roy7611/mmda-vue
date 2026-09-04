import {
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  unref,
  watch,
} from "vue";
import {
  ensureListFieldVisibleWhenFrozen,
  isListFrozen,
  MetaUiFieldFrozen,
  type MetaUi,
} from "@mmda/core";
import {
  isPersistableListColumn,
  persistListPack,
  type UiViewContext,
} from "@mmda/vui";
import { createSpinner, hideSpinner, showSpinner } from "@syncfusion/ej2-popups";
import { GridComponent } from "@syncfusion/ej2-vue-grids";
import { SF_GRID_MODULES } from "./grid-inject";

/** 程序化 h() 下用 provide 注入模块，对齐 Syncfusion Vue 文档写法。 */
export const SfGrid = defineComponent({
  name: "SfGrid",
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

/**
 * 绑定 context.loading（Ref 或 boolean）：查询中盖住表格并用 EJ2 Spinner。
 * `e-icons e-spin` 不是有效字形，必须用 createSpinner/showSpinner。
 */
export const SfGridLoadingHost = defineComponent({
  name: "SfGridLoadingHost",
  props: {
    loading: { type: [Boolean, Object], default: false },
  },
  setup(props, { slots }) {
    const hostRef = ref<HTMLElement | null>(null);
    let spinnerReady = false;

    const ensureSpinner = (el: HTMLElement) => {
      if (spinnerReady) return;
      createSpinner({
        target: el,
        width: 42,
        type: "Material3",
      });
      spinnerReady = true;
    };

    const sync = () => {
      const el = hostRef.value;
      if (!el) return;
      ensureSpinner(el);
      if (Boolean(unref(props.loading as any))) showSpinner(el);
      else hideSpinner(el);
    };

    onMounted(() => {
      void nextTick(sync);
    });
    onBeforeUnmount(() => {
      const el = hostRef.value;
      if (el && spinnerReady) hideSpinner(el);
    });
    watch(
      () => unref(props.loading as any),
      () => {
        void nextTick(sync);
      },
    );

    return () =>
      h(
        "div",
        {
          ref: hostRef,
          class: [
            "mmda-sf-grid-loading-host",
            Boolean(unref(props.loading as any)) ? "is-loading" : null,
          ],
        },
        slots.default?.(),
      );
  },
});

/** EJ2 autoFit 会把 width 写成 `180px`；Number('180px') 是 NaN，listSize 就写不回去。 */
export const parseGridColumnWidth = (width: unknown): number | undefined => {
  if (width == null || width === "") return undefined;
  const value = typeof width === "number" ? width : parseFloat(String(width));
  return Number.isFinite(value) && value > 0 ? Math.round(value) : undefined;
};

export const syncMetaUiFromGridColumns = (ej2Grid: any, metaui: MetaUi) => {
  const columns = (ej2Grid.getColumns?.() ?? []).filter(
    (column: any) =>
      isPersistableListColumn(column.field) && column.type !== "checkbox",
  );
  columns.forEach((column: any, index: number) => {
    const field = metaui.getField(column.field);
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
  metaui.getListedFields(true);
};

export const waitForGridPaint = async () => {
  await nextTick();
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
};

/** 工具栏「自动列宽」：EJ2 autoFitColumns + 回写 metaui.listSize 并缓存。 */
export async function autoFitSyncfusionListGrid(context: UiViewContext<any>) {
  if (typeof document === "undefined") return;
  const metaui = context.metaui;
  if (!metaui) return;
  const element = document.querySelector(".e-grid.mmda-sf-table");
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
  syncMetaUiFromGridColumns(ej2Grid, metaui);
  await persistListPack(context);
}
