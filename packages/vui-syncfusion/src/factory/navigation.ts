import { h } from "vue";
import { type MetaUi, type Pagination } from "@mmda/core";
import {
  readStoredPageSize,
  type UiListPropsType,
  type UiPaginatorPropsType,
} from "@mmda/vui";
import { PagerComponent } from "@syncfusion/ej2-vue-grids";
import {
  AppBarComponent,
  MenuComponent,
} from "@syncfusion/ej2-vue-navigations";
import { getSyncfusionCulture } from "../syncfusion_i18n";
import { SfTree } from "../components/SfTree";
import {
  STABLE_PAGE_SIZE_OPTIONS,
  invoke,
  normalizeMenuItem,
} from "./utils";

export function attachNavigationRenderers(factory: any) {
  factory.paginator = (pagination: Pagination, props: UiPaginatorPropsType) => {
    const pageSizeOptions = props.pageSizeOptions
      ? props.pageSizeOptions.map(String)
      : STABLE_PAGE_SIZE_OPTIONS;
    const currentPage = pagination.pageNo ?? 1;
    const currentSize = pagination.pageSize ?? readStoredPageSize();
    const notifyPage = (pageNo: number, pageSize: number) => {
      const nextNo = Math.max(1, Number(pageNo) || 1);
      const nextSize = Number(pageSize) || currentSize;
      if (nextNo === currentPage && nextSize === currentSize) return;
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
          args.currentPage ?? currentPage,
          args.pageSize ?? currentSize,
        );
      },
      dropDownChanged: (args: any) => {
        const nextSize = args?.pageSize ?? args?.value ?? currentSize;
        notifyPage(1, nextSize);
      },
    });
  };

  factory.tree = (props: any) => h(SfTree, props as any);

  factory.list = <T>(model: T[], metaui: MetaUi, props: UiListPropsType<T>) =>
    h("div", { class: "mmda-sf-list" }, [
      model.length
        ? model.map((item, index) =>
            h(
              "article",
              {
                key:
                  props.itemKey?.(item) ??
                  String(
                    metaui.primaryKey
                      ? (item as any)[metaui.primaryKey]
                      : index,
                  ),
                class: ["mmda-sf-list__item", props.itemClass?.(item)],
                style: props.itemStyle?.(item),
                onClick: () => props.onItemClick?.(item),
                onDblclick: () => props.onItemDoubleClick?.(item),
              },
              invoke(props.item?.(item, index)) as any,
            ),
          )
        : (props.empty?.() ?? ""),
    ]);

  factory.menubar = (items: any[], props: any, slots: any) =>
    h(
      AppBarComponent as any,
      { class: "mmda-sf-menubar", ...props },
      {
        default: () =>
          h(MenuComponent as any, {
            items: items.map((item) => normalizeMenuItem(item)),
          }),
        ...slots,
      },
    );
}
