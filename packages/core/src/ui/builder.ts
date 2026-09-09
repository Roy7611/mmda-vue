import type { MetaUiField } from '../metaui/metaui_field'
import type { MetaUi, MetaUiGroup } from '../metaui/metaui_group'
import type { UiContext } from './context'
import type {
  UiConfirmProps,
  UiDialogButton,
  UiDialogProps,
  UiToastProps,
} from './dialog'
import type { UiFactory } from './factory'
import type { UiFieldFactory } from './field_factory'
import type { UiListProps, UiPaginatorProps } from './list'
import type { UiTableProps } from './table'
import type { UiGridProps, UiTreeGridProps } from './grid'
import type { UiProps } from './props'
import type {
  UiTreeListViewProps,
  UiTreeProps,
  UiTreeViewProps,
} from './tree'

/**
 * 拼屏与会话级弹层的契约（无实现、无 Vue）。
 *
 * 分层：Logic 只认本接口；vui 的 `VueUiBuilder` 钉 `TNode = VNode`；
 * 皮肤再 `extends`（如 `SyncfusionUiBuilder`）。不要在本文件 import 框架。
 *
 * 和旁边两个接口不要混：
 * - {@link UiFactory}：原子控件（按钮、表、输入）。皮肤 `components/` + `factory/`。
 * - {@link UiFieldFactory}：按 `MetaUiField` 产字段编辑/展示。
 * - **本接口**：把控件拼成整页/弹层，并提供 `toast` / `confirm` / `dialog`。
 *
 * 弹层不要走 `factory.dialog`（没有这个方法）。业务会话用 `context.uiBuilder`
 * 或 `app.ui`，不要直接调厂商 Dialog。
 *
 * 多数 `build*` 是可选的：皮肤按需实现；`buildView` / `toast` / `confirm` / `dialog` 是入口。
 *
 * @typeParam TNode 框架节点。vui 为 Vue `VNode`；core 保持 `any` 以免依赖 Vue。
 */
export interface UiBuilder<TNode = any> {
  /** 原子控件工厂。拼屏时 `this.factory.table(...)` 等，不要绕开去 new 厂商组件。 */
  readonly factory: UiFactory<TNode>
  /** 字段控件工厂。表单/单元格按元数据产编辑器或只读展示。 */
  readonly fldFactory: UiFieldFactory<TNode>

  /**
   * 轻提示，无返回值。失败/成功消息用这个，不要用 `confirm`。
   * 实现可同步可异步；调用方不必 await。
   */
  toast(context: UiContext, props: UiToastProps): void | Promise<void>

  /**
   * 是/否确认。`true` = 确定，`false` = 取消。
   * 业务写在 `if (await confirm(...))` 里，不要 `accept` 回调。
   */
  confirm(context: UiContext, props: UiConfirmProps): Promise<boolean>

  /**
   * 弹层塞内容。resolve 用户点的**右侧标准键**（`ok` / `cancel` / `yes` …）。
   * X/Esc → `cancel`。左侧 `customActions`（如 Apply）不关窗、不结束 Promise。
   * `header` 插槽换掉 title；`footer` 插槽换掉标准键与 customActions。
   * 关窗前：主按钮 `onAccept(button)`，其余 `onReject(button)`；return false 不关。
   *
   * 选记录：无 UI 用 `searchRelative`；有列表弹层用 `context.select`（内部 `buildView` + 本方法）。
   *
   * @param content 已构造的节点（或数组），不是路由组件名。
   * @param context 会话；选择器传 selectCtx，留给脚左侧 customActions.onAction(context)。
   */
  dialog(
    content: TNode | TNode[],
    context: UiContext,
    props?: UiDialogProps<TNode>,
  ): Promise<UiDialogButton>

  /**
   * 按 `context.view` 拼整页或弹层主体。
   *
   * - 多对象（index / selectOne / selectMany 等）→ 列表族（工具栏 + 数据区 + 分页）
   * - 单对象（details / edit / create）→ 表单
   *
   * 选择器就是 `selectOne` / `selectMany` 视图，走同一入口。
   * `props` 为拼屏 extras（`selectionMode`、是否显示工具栏等），不要塞厂商 API。
   */
  buildView(context: UiContext, props?: Record<string, unknown>): TNode

  /**
   * 列表整页：工具栏 + 搜索栏 + 数据区 + 分页。
   * 数据区按场景再分 {@link buildList} / {@link buildTable} / {@link buildGrid}，
   * 不是三种互斥的路由页。
   */
  buildListView?(
    context: UiContext,
    props?: Record<string, unknown>,
  ): TNode

  /**
   * 只读高性能表（索引大页、虚拟滚动）。`props` 用 {@link UiTableProps}，
   * 列结构来自 `context.metaUi`，不要在 Logic 里拼厂商列数组。
   */
  buildTable?(
    context: UiContext,
    props?: UiTableProps<any, TNode>,
  ): TNode

  /**
   * 可编网格（子表、inplace）。与 table 的差异在 {@link UiGridProps}（编辑、行详情等）。
   */
  buildGrid?(
    context: UiContext,
    props?: UiGridProps<any, TNode>,
  ): TNode

  /**
   * 卡片/移动端列表形态。不要和 `buildListView` 整页混淆。
   */
  buildList?(
    context: UiContext,
    props?: UiListProps<any>,
  ): TNode

  /**
   * 底部分页条。索引表虚拟滚动时服务端页码走这个，不要和表内虚拟窗混成一套 pager。
   */
  buildPaginator?(
    context: UiContext,
    props?: UiPaginatorProps,
  ): TNode

  /**
   * chrome 导航树（节点标签 + 展开）。薄包 `factory.tree`。
   */
  buildTree?<T>(props: UiTreeProps<T, TNode>): TNode

  /**
   * 树形 chrome 页（搜索 + factory.tree + 底栏）。`context` 在前，与 {@link buildListView} /
   * {@link buildTreeListView} 同序，不要改成 props 在前。
   */
  buildTreeView?<T>(
    context: UiContext,
    props?: UiTreeViewProps<T, TNode>,
  ): TNode

  /**
   * 树表数据区（有父子行）。行级 `rowContext` 给嵌套会话（子表 Logic），
   * 参数顺序是 `rows, metaUi, rowContext, props`，与 factory.treeGrid 对齐。
   */
  buildTreeGrid?(
    rows: any[],
    metaUi: MetaUi,
    rowContext: (row: any) => UiContext,
    props?: UiTreeGridProps<any, TNode>,
  ): TNode

  /** 树表整页（chrome + treeGrid）。 */
  buildTreeGridView?(
    context: UiContext,
    props?: UiTreeGridProps<any, TNode>,
  ): TNode

  /**
   * 左树 + 右表。分类树点节点过滤右侧列表（如物料按分类）。
   */
  buildTreeListView?<T>(
    context: UiContext,
    props?: UiTreeListViewProps<T, TNode>,
  ): TNode

  /**
   * 单个字段控件。通常转 `fldFactory`；自定义 renderer 也可在皮肤覆盖。
   */
  buildField?(
    field: MetaUiField,
    context: UiContext,
    props?: UiProps,
  ): TNode

  /**
   * 元数据组（主表区块或子表）。`children` 已是组内字段/子表节点。
   */
  buildGroup?(
    group: MetaUiGroup,
    context: UiContext,
    children?: TNode[],
    props?: UiProps,
  ): TNode

  /**
   * Logic 完全自定义的一屏。`context.view` 对不上标准 index/details 时用。
   */
  buildCustomView?(
    context: UiContext,
    props?: UiProps,
  ): TNode

  /**
   * 布局壳：纵向排 children。不是应用脚手架 `AppLayout`。
   */
  buildContainer?(
    children: TNode[],
    props?: UiProps,
  ): TNode

  /** 页眉区（工具栏、面包屑）。 */
  buildHeader?(
    children: TNode | TNode[],
    props?: UiProps,
  ): TNode

  /** 主内容区（表、表单）。flex 子项通常要 `minHeight: 0` 才能让表内滚。 */
  buildMain?(
    children: TNode | TNode[],
    props?: UiProps,
  ): TNode

  /** 页脚区。 */
  buildFooter?(
    children: TNode | TNode[],
    props?: UiProps,
  ): TNode
}
