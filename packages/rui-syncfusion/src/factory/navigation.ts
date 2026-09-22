import { createElement, type ReactElement, type ReactNode } from "react";
import {
  ContextMenuComponent,
  SidebarComponent,
  TreeViewComponent,
} from "@syncfusion/ej2-react-navigations";
import { ListViewComponent } from "@syncfusion/ej2-react-lists";
import { SplitterComponent } from "@syncfusion/ej2-react-layouts";
import { PagerComponent } from "@syncfusion/ej2-react-grids";
import {
  carouselModifierClasses,
  contextMenuModifierClasses,
  sidebarModifierClasses,
  splitterHeightOf,
  splitterModifierClasses,
  splitterOrientationOf,
  splitterWidthOf,
  type UiCarouselItem,
  type UiCarouselProps,
  type UiContextMenuProps,
  type UiDrawerProps,
  type UiListProps,
  type UiMenuItem,
  type UiPaginatorProps,
  type UiSidebarProps,
  type UiSplitterProps,
  type UiSplitterSlots,
  type UiTreeProps,
} from "@mmda/core";
import {
  el,
  joinClass,
  nativeDomProps,
  sfCssClass,
  sfHtmlAttributes,
} from "./utils";

function contextItems(items: UiMenuItem[] = []): Record<string, unknown>[] {
  return items.map((item) => ({
    text: item.label ?? item.name ?? "",
    iconCss: item.icon,
    separator: item.divider,
    disabled: item.disabled,
    items: item.items ? contextItems(item.items) : undefined,
  }));
}

export function createContextMenu(props: UiContextMenuProps): ReactElement {
  return createElement(ContextMenuComponent as any, {
    target: props.target,
    items: contextItems(props.items),
    disabled: props.disabled === true,
    cssClass: sfCssClass(props, contextMenuModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    select: (args: { item?: { text?: string } }) => {
      const item = (props.items ?? []).find(
        (it) => (it.label ?? it.name ?? "") === args.item?.text,
      );
      if (item) props.onSelect?.(item);
    },
    beforeOpen: (args: any) => {
      if (props.onBeforeOpen) {
        const result = props.onBeforeOpen(args);
        if (result === false) args.cancel = true;
      }
      if (props.resolveItems) {
        const items = props.resolveItems(args);
        if (items === false) {
          args.cancel = true;
        } else {
          (args as any).items = contextItems(items);
        }
      }
    },
  });
}

export function createSidebar(
  props: UiSidebarProps,
  slots?: { default?: () => ReactNode },
): ReactElement {
  return createElement(
    SidebarComponent as any,
    {
      isOpen: props.isOpen,
      position: props.position ?? "Left",
      type: props.type ?? "Auto",
      width: props.width,
      showBackdrop: props.showBackdrop,
      closeOnDocumentClick: props.closeOnDocumentClick,
      enableDock: props.enableDock,
      dockSize: props.dockSize,
      target: props.target,
      mediaQuery: props.mediaQuery,
      enableGestures: props.enableGestures,
      cssClass: sfCssClass(props, sidebarModifierClasses(props)),
      htmlAttributes: sfHtmlAttributes(props),
      change: (args: { isOpen?: boolean }) =>
        props.onChange?.(Boolean(args?.isOpen)),
    },
    slots?.default?.() ?? null,
  );
}

export function createDrawer(
  props: UiDrawerProps,
  slots?: { default?: () => ReactNode },
): ReactElement {
  return createSidebar({ ...props, type: "Over" }, slots);
}

export function createCarousel(
  props: UiCarouselProps<ReactNode>,
): ReactElement {
  const index = props.selectedIndex ?? 0;
  const renderItem = (item: UiCarouselItem<ReactNode>, i: number): ReactNode =>
    props.itemRenderer
      ? props.itemRenderer(item, i)
      : (item.content ??
        (item.src
          ? el("img", { src: item.src, alt: item.alt, title: item.title })
          : null));

  return el(
    "div",
    {
      ...nativeDomProps(props),
      className: joinClass("mmda-carousel", carouselModifierClasses(props)),
    },
    ...props.items.map((item, i) =>
      el(
        "div",
        {
          key: item.key ?? i,
          className:
            i === index
              ? "mmda-carousel__item mmda-carousel__item--active"
              : "mmda-carousel__item",
        },
        renderItem(item, i),
      ),
    ),
  );
}

export function createList<T>(props: UiListProps<T>): ReactElement {
  const fields = {
    id: props.primaryKey ?? "id",
    text: props.linkField ?? "label",
  };
  return createElement(ListViewComponent as any, {
    dataSource: props.rows ?? [],
    fields,
    cssClass: sfCssClass(props, "mmda-list"),
    htmlAttributes: sfHtmlAttributes(props),
    actionBegin: (args: { event?: { target?: HTMLElement }; itemData?: T }) => {
      const item = args.itemData;
      if (item != null) props.onItemClick?.(item);
    },
  });
}

export function createTree<T>(props: UiTreeProps<T, ReactNode>): ReactElement {
  const fields = {
    dataSource: props.fields?.children ?? "children",
    id: props.fields?.id ?? "id",
    text:
      typeof props.fields?.label === "string" ? props.fields.label : "label",
    parentID: props.fields?.parentId ?? "parentId",
    hasChildren:
      typeof props.fields?.childrenCount === "string"
        ? props.fields.childrenCount
        : undefined,
  };
  return createElement(TreeViewComponent as any, {
    dataSource: props.data ?? [],
    fields,
    showCheckBox: props.selectionMode === "checkbox",
    allowDragAndDrop: props.allowDragDrop === true,
    cssClass: sfCssClass(props, "mmda-tree"),
    htmlAttributes: sfHtmlAttributes(props),
    nodeSelected: (args: { nodeData?: T }) => {
      if (args.nodeData != null) props.onNodeSelect?.(args.nodeData);
    },
  });
}

export function createSplitter(
  props: UiSplitterProps = {},
  slots?: UiSplitterSlots<ReactNode>,
): ReactElement {
  const panes = slots?.default?.() ?? [];
  const orientation = splitterOrientationOf(props);
  const isVertical = orientation === "Vertical";
  return createElement(
    SplitterComponent as any,
    {
      orientation,
      width: splitterWidthOf(props),
      height: splitterHeightOf(props),
      separatorSize: props.separatorSize,
      cssClass: sfCssClass(props, splitterModifierClasses(props)),
      htmlAttributes: sfHtmlAttributes(props),
      resized: (args: { paneSize?: number[] }) =>
        props.onResizeStop?.({ index: 0, paneSize: args.paneSize }),
    },
    ...panes.map((pane, index) =>
      el(
        "div",
        {
          key: index,
          className: joinClass("e-pane", pane.cssClass),
          style: isVertical ? { height: pane.size } : { width: pane.size },
          "data-min": pane.min,
          "data-max": pane.max,
        },
        pane.content,
      ),
    ),
  );
}

export function createPaginator(props: UiPaginatorProps): ReactElement {
  const pagination = props.pagination ?? {};
  const pageSize = pagination.pageSize ?? props.pageSizeOptions?.[0] ?? 20;
  return createElement(PagerComponent as any, {
    totalRecordsCount: pagination.recordCount ?? 0,
    pageSize,
    currentPage: pagination.pageNo ?? 1,
    pageCount: pagination.pageCount,
    pageSizes: props.pageSizeOptions ?? [10, 20, 50, 100],
    cssClass: sfCssClass(props, "mmda-paginator"),
    click: (args: any) => {
      const nextSize = args?.newProp?.pageSize;
      if (nextSize != null && nextSize !== pageSize) {
        void props.onPage({ pageSize: nextSize });
        return;
      }
      if (args?.currentPage != null)
        void props.onPage({ pageNo: args.currentPage });
    },
  });
}
