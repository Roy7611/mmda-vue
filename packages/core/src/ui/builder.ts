import type { MetaUiField } from '../metaui/metaui_field'
import type { MetaUiGroup } from '../metaui/metaui_group'
import type { UiContext } from './context'
import type {
  UiConfirmProps,
  UiDialogButton,
  UiDialogProps,
  UiToastProps,
} from './builder/dialog'
import type { UiMessageProps } from './factory/message'
import type { UiFactory } from './factory'
import type { UiFieldFactory } from './field_factory'
import type { UiProps } from './props'
import type { UiAppSideMenuProps } from './app_side_menu'
import type { UiViewProps } from './view'
import type { UiListViewProps } from './builder/list_view'
import type { UiExplorerViewProps } from './builder/explorer'
import type { UiGanttViewProps } from './factory/gantt'
import type { UiTimelineProps } from './factory/timeline'
import type { UiSchedulerViewProps } from './factory/scheduler'
import type { UiKanbanViewProps } from './factory/kanban'
import type { UiDiagramViewProps } from './factory/diagram'

/**
 * 拼屏与会话级弹层的契约（无实现、无 Vue）。
 *
 * 四职分工：
 * - {@link UiLayout} / {@link UiAppLayout}：怎么排（壳、字段行、container）
 * - {@link UiFieldFactory}：一个 MetaUiField 画成控件（`render` / `editFor` / `displayFor`）
 * - {@link UiFactory}：一个 chrome 控件（table、button、sidebar…）
 * - **本接口**：组装多块组合（模块页、侧栏菜单、字段组、Explorer）+ Overlay
 *
 * 不要把单控件薄包装进 Builder（无 `buildTable` / `buildPaginator` / `buildContainer`）。
 * 弹层不要走 `factory.dialog`。业务用 `context.uiBuilder` 或 `app.ui`。
 *
 * @typeParam TNode 框架节点。vui 为 Vue `VNode`；core 保持 `any` 以免依赖 Vue。
 */
export interface UiBuilder<TNode = any> {
  /** 原子控件工厂。拼屏时 `this.factory.table(...)` 等。 */
  readonly factory: UiFactory<TNode>
  /** 字段控件工厂。表单行用 `fldFactory.render`；单元格用具名 renderer。 */
  readonly fldFactory: UiFieldFactory<TNode>

  // —— Overlay（会话入口，不是控件）——

  /**
   * 轻提示（右侧 Overlay Toast）。
   * 详情/编辑页顶栏用 {@link message}，不要用本方法顶替。
   */
  toast(context: UiContext, props: UiToastProps): void | Promise<void>

  /**
   * 页内消息条（详情/编辑 PageBody 全宽顶栏）。
   * 列表等无 PageBody 的会话可回落 `toast`。
   */
  message(context: UiContext, props: UiMessageProps): void | Promise<void>

  /**
   * 是/否确认。`true` = 确定，`false` = 取消。
   * 业务写在 `if (await confirm(...))` 里，不要 `accept` 回调。
   */
  confirm(context: UiContext, props: UiConfirmProps): Promise<boolean>

  /**
   * 弹层塞内容。resolve 用户点的右侧标准键（`ok` / `cancel` / `yes` …）。
   * X/Esc → `cancel`。左侧 `customActions`（如 Apply）不关窗、不结束 Promise。
   *
   * @param content 已构造的节点（或数组），不是路由组件名。
   * @param context 会话；选择器传 selectCtx，留给脚左侧 customActions。
   */
  dialog(
    content: TNode | TNode[],
    context: UiContext,
    props?: UiDialogProps<TNode>,
  ): Promise<UiDialogButton>

  // —— App（壳走 UiAppLayout；这里只产 nav 槽内容）——

  /**
   * 应用左侧菜单（一级轨 / 树 / compact 抽屉）。
   * 壳本身用 {@link UiAppLayout.scaffold}，不要 `buildAppScaffold`。
   * 内部用 `factory.sidebar` / `factory.drawer`，不要再包一层 Builder sidebar。
   */
  buildAppSideMenu?(props: UiAppSideMenuProps<TNode>): TNode

  // —— Module（具名入口 → buildEntityView）——

  /**
   * 索引列表页。内部：`buildModuleToolbar` + `factory.table|grid|list|treeGrid` + `factory.paginator`。
   * 不要再经 `buildListView`。
   */
  buildIndexView?(
    context: UiContext,
    props?: UiListViewProps,
  ): TNode

  /**
   * 选择器（selectOne / selectMany）。与 Index 同形，selectionMode 由 view 决定。
   */
  buildSelectView?(
    context: UiContext,
    props?: UiListViewProps,
  ): TNode

  /**
   * 详情页（只读表单）。转到 {@link buildEntityView}。
   */
  buildDetailsView?(
    context: UiContext,
    props?: UiViewProps,
  ): TNode

  /**
   * 编辑页。create 走同一方法，由 `context.view === create` 区分。
   */
  buildEditView?(
    context: UiContext,
    props?: UiViewProps,
  ): TNode

  /**
   * 实体屏共享实现。
   * - many → Index/Select 数据区（或 Explorer / 插件页）
   * - one → 扫 `metaUi.groups`：`many` ? {@link buildSubGroup} : {@link buildFieldGroup}
   *
   * 替代旧 `buildView`。
   */
  buildEntityView(
    context: UiContext,
    props?: UiViewProps | UiListViewProps,
  ): TNode

  /**
   * 模块页工具栏（面包屑 + 动作 + 可选搜索）。
   */
  buildModuleToolbar?(
    context: UiContext,
    props?: UiProps,
  ): TNode

  // —— Module / 插件页（可选；未 setXxxPlugin 时 throw）——

  /** 甘特整页。不进 UiFactory；实现转 ganttPlugin。 */
  buildGanttView?(
    context: UiContext,
    props?: UiGanttViewProps,
  ): TNode

  /** 时间轴整页。嵌在屏里仍可用 `factory.timeline`。 */
  buildTimelineView?(
    context: UiContext,
    props?: UiTimelineProps,
  ): TNode

  /** 日程整页。 */
  buildSchedulerView?(
    context: UiContext,
    props?: UiSchedulerViewProps,
  ): TNode

  /** 看板整页。 */
  buildKanbanView?(
    context: UiContext,
    props?: UiKanbanViewProps,
  ): TNode

  /** 图整页。 */
  buildDiagramView?(
    context: UiContext,
    props?: UiDiagramViewProps,
  ): TNode

  // —— 复杂组件（多块组合）——

  /**
   * 左树右表（分类浏览）。不是单控件，故留在 Builder。
   */
  buildExplorerView?<T>(
    context: UiContext,
    props?: UiExplorerViewProps<T, TNode>,
  ): TNode

  /**
   * 主表字段分组（`group.many === false`）。
   * 对每个可见字段调 `fldFactory.render`（内含默认 layoutField）。
   * 不要一个方法兼管子表。
   */
  buildFieldGroup?(
    group: MetaUiGroup,
    context: UiContext,
    props?: UiProps,
  ): TNode

  /**
   * 子表（`group.many === true`）。
   * 管 subGroupContext、组标题、增删行壳；内容直接 `factory.grid` / `factory.treeGrid`
   *（相册仍 `factory.imageGallery`）。不要再套 `buildGridView`。
   */
  buildSubGroup?(
    group: MetaUiGroup,
    context: UiContext,
    props?: UiProps,
  ): TNode
}
