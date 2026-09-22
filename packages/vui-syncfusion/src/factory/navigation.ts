import { h } from "vue";
import { type MetaUi } from "@mmda/core";
import {
  readStoredPageSize,
  type VuiListPropsType,
  type UiPaginatorProps,
} from "@mmda/vui";
import { PagerComponent } from "@syncfusion/ej2-vue-grids";
import {
  AppBarComponent,
  MenuComponent,
} from "@syncfusion/ej2-vue-navigations";
import { getSyncfusionCulture } from "../syncfusion_i18n";
import { createTree } from "./tree";
import { STABLE_PAGE_SIZE_OPTIONS, invoke, normalizeMenuItem } from "./utils";

export const navigationRenderers = {
  paginator: (props: UiPaginatorProps) => {
    const pagination = props.pagination;
    const pageSizeOptions = props.pageSizeOptions
      ? props.pageSizeOptions.map(String)
      : STABLE_PAGE_SIZE_OPTIONS;
    const currentPage = pagination.pageNo ?? 1;
    const currentSize = pagination.pageSize ?? readStoredPageSize();
    const notifyPage = (pageNo: number, pageSize: number) => {
      const nextNo = Math.max(1, Number(pageNo) || 1);
      const nextSize = Number(pageSize) || (pagination.pageSize ?? currentSize);
      const liveNo = pagination.pageNo ?? 1;
      const liveSize = pagination.pageSize ?? currentSize;
      if (nextNo === liveNo && nextSize === liveSize) return;
      props.onPage({ pageNo: nextNo, pageSize: nextSize });
    };
    return h(PagerComponent as any, {
      currentPage,
      pageSize: currentSize,
      totalRecordsCount: pagination.recordCount ?? 0,
      locale: getSyncfusionCulture(),
      pageSizes: pageSizeOptions,
      click: (args: any) => {
        if (args?.cancel || args?.isInteracted === false) return;
        notifyPage(
          args.currentPage ?? pagination.pageNo ?? 1,
          args.pageSize ?? pagination.pageSize ?? currentSize,
        );
      },
      dropDownChanged: (args: any) => {
        const nextSize =
          args?.pageSize ?? args?.value ?? pagination.pageSize ?? currentSize;
        notifyPage(1, nextSize);
      },
    });
  },

  tree: (props: any) => createTree(props),

  list: <T>(props: VuiListPropsType<T> = {} as VuiListPropsType<T>) => {
    // list 家族内部一律单参 `(props)`：`rows` / `primaryKey` / `fields` 由 vui
    // `factory/list.ts` 的 propsOf 归一（旧三参形态只在那一层兼容）
    const bag = props as any;
    const model = (bag.rows ?? bag.model ?? []) as T[];
    const primaryKey = bag.primaryKey as string | undefined;
    return h("div", { class: "mmda-list" }, [
      model.length
        ? model.map((item, index) =>
            h(
              "article",
              {
                key:
                  props.itemKey?.(item) ??
                  String(primaryKey ? (item as any)[primaryKey] : index),
                class: ["mmda-list__item", props.itemClass?.(item)],
                style: props.itemStyle?.(item),
                onClick: () => props.onItemClick?.(item),
                onDblclick: () => props.onItemDoubleClick?.(item),
              },
              invoke(props.item?.(item, index)) as any,
            ),
          )
        : (props.empty?.() ?? ""),
    ]);
  },

  menubar: (items: any[], props: any, slots: any) =>
    h(
      AppBarComponent as any,
      { class: "mmda-menubar", ...props },
      {
        default: () =>
          h(MenuComponent as any, {
            items: items.map((item) => normalizeMenuItem(item)),
          }),
        ...slots,
      },
    ),
};
