import { h, type VNode, type VNodeChild, type VNodeArrayChildren } from "vue";
import type { ChildSlot } from "./ui_view";
import { MmdaPageRegions } from "./components/PageRegions";

export type PropData = Record<string, any>;
export type CustomProps<T> = T & PropData;
export type UiSlots = {
  [index: string]: any;
  default?: ChildSlot;
  header?: ChildSlot;
  footer?: ChildSlot;
};
/**
 * 域布局，竖排或横排
 */
export type UiDirection = "vertical" | "horizontal";
export type UiFieldLayout = UiDirection;
/**
 * 对齐方式
 */
export type UiVertAlign = "top" | "middle" | "bottom";
export type UiHorzJustify =
  | "start"
  | "end"
  | "center"
  | "space-around"
  | "space-between"
  | "space-evenly";
/**
 * 列布局固定宽度类型
 * @example
 * ```ts
 * { fixed: '100px'}
 * ```
 */
export interface UiFixedColWidth {
  fixed: string;
}
/**
 * 列布局宽度，通常为1~12的数字或者固定宽度
 *
 * @example
 * ```ts
 * //数字 2 =>
 * {class: 'col-2'}
 * //固定列宽 { fixed: '2rem' } =>
 * {class: 'col-fixed' style: { width: '2em'}}
 * ```
 */
export type UiColWidth = number | UiFixedColWidth;

/**
 * 移动端列表项具名插槽
 */
export interface UiListTileSlots {
  leading?: ChildSlot;
  title: ChildSlot;
  subtitle?: ChildSlot;
  trailing?: ChildSlot;
}
export type UiListTileRenderer<T = any> = (model: T, layout: UiLayout) => VNode;

/**
 * 界面布局
 */
export interface UiLayout {
  /**
   * 域布局，竖排或横排
   */
  fieldLayout: UiFieldLayout;
  /**
   * 是否由默认 FieldLayout 显示校验消息。
   * 控件库已经内置校验消息时保持 false。
   */
  fieldMessage?: boolean;
  wrapManyGroup: boolean;
  maxCols: number;
  /**
   * 单元格布局
   * @param child 子元素
   * @param nCol 占几列
   * @returns
   */
  cell: (child: VNodeChild, nCol?: number) => VNode;
  /**
   * 单元格固定列宽布局
   * @param child 子元素
   * @param fixedWidth 固定列宽，如`'100px'`
   * @returns
   */
  // cellFw: (child:VNodeChild, fixedWidth: string)=>VNode;
  /**
   * 单行布局
   * @param children 子元素
   * @param nCols 子元素列宽，总和必须在1~12之间
   * @returns
   */
  row: (
    children: VNodeArrayChildren,
    nCols: number[],
    props?: PropData,
  ) => VNode;
  /**
   * 单列布局
   * @param children 子元素，每个元素占满一行
   * @returns
   */
  column: (children: VNodeArrayChildren, props?: PropData) => VNode;

  /**
   * 表格布局，外围只会有一个grid div
   * @param children 子元素
   * @param nCols 子元素列宽，总和必须在1~12之间
   * @returns
   */
  grid: (
    children: VNodeArrayChildren,
    nCols: number[],
    props?: PropData,
  ) => VNode;

  /**
   * 列表项布局
   * @param slots 列表项具名插槽
   * @returns
   */
  listTile: (slots: UiListTileSlots) => VNode;
}

export interface FieldLayoutOptions {
  label: VNodeChild;
  control: VNodeChild;
  direction?: UiDirection;
  message?: VNodeChild;
  props?: PropData;
}

export type FieldGroupDirection = "row" | "column" | "table";

export interface FieldGroupLayoutOptions {
  fields: VNodeArrayChildren;
  direction?: FieldGroupDirection;
  cols?: 1 | 2 | 3;
  props?: PropData;
}

export interface PageLayoutOptions {
  toolbar?: VNodeChild;
  stickyToolbar?: boolean;
  primary: VNodeArrayChildren;
  summary?: VNodeArrayChildren;
  tails?: VNodeArrayChildren;
  footer?: VNodeChild;
  /** 右侧概要栏初始是否展开，默认 true */
  summaryExpanded?: boolean;
  props?: PropData;
}

export type AppLayoutVariant = "sidebarLeft" | "topBarFull";

export interface AppLayoutOptions {
  topBar?: VNodeChild;
  nav?: VNodeChild;
  page?: VNodeChild;
  bottomBar?: VNodeChild;
  props?: PropData;
}

const layoutProps = (
  className: string,
  style: Record<string, any>,
  props: PropData = {},
) => ({
  ...props,
  class: [className, props.class],
  style: { ...style, ...props.style },
});

/** 组合字段的标签、控件和可选校验消息。 */
export function layoutField(options: FieldLayoutOptions): VNode {
  const { label, control, message, direction = "vertical", props } = options;
  const horizontal = direction === "horizontal";
  return h(
    "div",
    layoutProps(
      `mmda-field-layout mmda-field-${direction}`,
      // 横排不写 display：组内用 contents 参与父网格；独立时靠 CSS .mmda-field-horizontal
      horizontal
        ? {}
        : {
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          },
      { "data-direction": direction, ...props },
    ),
    [
      h("div", { class: "mmda-field-label" }, label as any),
      h(
        "div",
        {
          class: "mmda-field-control",
          style: { minWidth: 0 },
        },
        [
          control as any,
          message == null
            ? null
            : h("div", { class: "mmda-field-message" }, message as any),
        ],
      ),
    ],
  );
}

/** 在主表分组内排列多个字段。
 * 列数 cols 为逻辑列（1/2/3）；若字段为 label|control 横排，CSS 用 2×cols 轨道对齐。
 */
export function layoutFieldGroup(options: FieldGroupLayoutOptions): VNode {
  const {
    fields,
    direction = "row",
    cols = direction === "column" ? 1 : 2,
    props,
  } = options;
  return h(
    "div",
    layoutProps(`mmda-field-group-layout mmda-field-group-${direction}`, {}, {
      role: direction === "table" ? "table" : "group",
      "data-cols": cols,
      ...props,
    }),
    fields,
  );
}

/**
 * 详情与编辑页共用布局。
 * 先左右分栏：左主区（primary + tails 自上而下），右概要（可折叠以拉宽主区）。
 * 工具栏独立行，正文区域自行滚动。
 */
export function layoutPage(options: PageLayoutOptions): VNode {
  const {
    toolbar,
    stickyToolbar = true,
    primary,
    summary = [],
    tails = [],
    footer,
    summaryExpanded = true,
    props,
  } = options;
  const hasSummary = summary.length > 0;
  const hasTails = tails.length > 0;

  return h(
    "section",
    layoutProps(
      "mmda-page-layout",
      {
        display: "grid",
        gridTemplateRows:
          toolbar == null ? "minmax(0, 1fr)" : "auto minmax(0, 1fr)",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
      },
      props,
    ),
    [
      toolbar == null
        ? null
        : h(
            "header",
            {
              class: [
                "mmda-page-toolbar",
                stickyToolbar && "mmda-page-toolbar-sticky",
              ],
              style: stickyToolbar
                ? { position: "sticky", top: 0, zIndex: 1 }
                : undefined,
            },
            toolbar as any,
          ),
      h(
        MmdaPageRegions,
        {
          hasSummary,
          summaryExpanded,
        },
        {
          primary: () => primary,
          tails: hasTails ? () => tails : undefined,
          summary: hasSummary ? () => summary : undefined,
          footer: footer == null ? undefined : () => footer,
        },
      ),
    ],
  );
}

/**
 * 应用脚手架。外壳不滚动，导航和页面容器分别管理滚动。
 */
export class AppLayout {
  constructor(public readonly variant: AppLayoutVariant = "sidebarLeft") {}

  render(
    options: AppLayoutOptions,
    variant: AppLayoutVariant = this.variant,
  ): VNode {
    return variant === "topBarFull"
      ? this.topBarFull(options)
      : this.sidebarLeft(options);
  }

  sidebarLeft(options: AppLayoutOptions): VNode {
    const hasTopBar = options.topBar != null
    return this.scaffold(
      options,
      "sidebarLeft",
      hasTopBar
        ? {
            gridTemplateAreas: '"nav top" "nav page" "nav bottom"',
            gridTemplateColumns: "auto minmax(0, 1fr)",
            gridTemplateRows: "auto minmax(0, 1fr) auto",
          }
        : {
            gridTemplateAreas: '"nav page" "nav bottom"',
            gridTemplateColumns: "auto minmax(0, 1fr)",
            gridTemplateRows: "minmax(0, 1fr) auto",
          },
    );
  }

  topBarFull(options: AppLayoutOptions): VNode {
    return this.scaffold(options, "topBarFull", {
      gridTemplateAreas: '"top top" "nav page" "bottom bottom"',
      gridTemplateColumns: "auto minmax(0, 1fr)",
      gridTemplateRows: "auto minmax(0, 1fr) auto",
    });
  }

  private scaffold(
    options: AppLayoutOptions,
    variant: AppLayoutVariant,
    grid: Record<string, string>,
  ): VNode {
    const { topBar, nav, page, bottomBar, props } = options;
    return h(
      "div",
      layoutProps(
        "mmda-app-layout",
        {
          display: "grid",
          ...grid,
          width: "100%",
          height: "100%",
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
        },
        { "data-layout": variant, ...props },
      ),
      [
        topBar == null
          ? null
          : h(
              "header",
              {
                class: "mmda-app-topbar",
                style: { gridArea: "top", minWidth: 0 },
              },
              topBar as any,
            ),
        h(
          "nav",
          {
            class: "mmda-app-nav",
            style: { gridArea: "nav", minHeight: 0, overflow: "auto" },
          },
          nav as any,
        ),
        h(
          "main",
          {
            class: "mmda-app-page",
            style: {
              gridArea: "page",
              minWidth: 0,
              minHeight: 0,
              overflow: "hidden",
            },
          },
          page as any,
        ),
        bottomBar == null
          ? null
          : h(
              "footer",
              { class: "mmda-app-bottom", style: { gridArea: "bottom" } },
              bottomBar as any,
            ),
      ],
    );
  }
}

/**
 * 移动端默认列表项布局
 * @param layout 布局
 * @param itemSlots 列表项插槽
 * @returns
 */
export function defaultListTile(
  layout: UiLayout,
  itemSlots: UiListTileSlots,
): VNode {
  const children: VNodeChild[] = [];

  let leftCols = layout.maxCols;
  const nCols: number[] = [];
  if (itemSlots.leading) {
    const leadingCols = 2;
    leftCols -= leadingCols;
    children.push(itemSlots.leading(), leadingCols);
    nCols.push(leadingCols);
  }

  if (itemSlots.subtitle) {
    const bodyNode = layout.column([itemSlots.title(), itemSlots.subtitle()]);
    children.push(bodyNode);
  } else {
    children.push(itemSlots.title());
  }

  if (itemSlots.trailing) {
    const tailingCols = 2;
    leftCols -= tailingCols;
    nCols.push(leftCols);
    children.push(itemSlots.trailing());
    nCols.push(tailingCols);
  } else {
    nCols.push(leftCols);
  }
  return layout.row(children, nCols);
}
