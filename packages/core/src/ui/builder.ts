import type { MetaUiField } from '../metaui/metaui_field'
import type { MetaUiGroup } from '../metaui/metaui_group'
import type { UiContext } from './context'
import type {
  UiConfirmProps,
  UiDialogAction,
  UiDialogProps,
  UiEntityDialogOptions,
  UiToastProps,
} from './builder/dialog'
import type { UiMessageProps } from './factory/message'
import type { UiFactory } from './factory'
import type { UiFieldFactory } from './field_factory'
import type { UiProps } from './props'
import type { UiAppSideMenuProps } from './app_side_menu'
import type { UiViewProps } from './view'
import type {
  UiSigninFormProps,
  UiSigninFormSlots,
  UiSignupFormProps,
  UiSignupFormSlots,
} from './factory/signin'
import type { UiFilterBarProps } from './builder/filter_bar'
import type { UiListViewProps } from './builder/list_view'
import type { UiExplorerProps } from './builder/explorer'
import type { UiGanttProps } from './factory/gantt'
import type { UiTimelineProps } from './factory/timeline'
import type { UiSchedulerProps } from './factory/scheduler'
import type { UiKanbanProps } from './factory/kanban'
import type { UiDiagramProps } from './factory/diagram'

/**
 * 界面构建器，负责拼屏与会话级弹层的契约（无实现、无 Vue）。
 *
 * 职责分工：
 * - {@link UiLayout}：布局怎么排（壳 scaffold、字段行、container）
 * - {@link UiFieldFactory}：界面域工厂负责将一个 MetaUiField 画成控件（`render` / `editFor` / `displayFor`）
 * - {@link UiFactory}：界面工厂负责创建一个独立控件（table、button、sidebar…）
 * - {@link Overlay}：会话入口，提供toast、message、dialog等弹层支持
 * - **本接口**：组装多块组合（模块页、侧栏菜单、登录/注册、字段组、Explorer）+ Overlay
 *
 * 不要把单控件薄包装进 Builder（无 `buildTable` / `buildPaginator` / `buildContainer`）。
 * 弹层不要走 `factory.dialog`。业务用 `context.uiBuilder` 或 `app.ui`。
 *
 * @typeParam TNode 框架节点。vui 为 Vue `VNode`；core 保持 `any` 以免依赖 Vue。
 */
export interface UiBuilder<TNode = any> {
  /** 原子控件工厂。拼屏时 `this.factory.table(...)` 等。 */
  readonly factory: UiFactory<TNode>
  /** 字段控件工厂。表单行用 `fieldFactory.render`；单元格用具名 renderer。 */
  readonly fieldFactory: UiFieldFactory<TNode>

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
   * 对话框弹层可塞内容。resolve 用户点的右侧标准键（`ok` / `cancel` / `yes` …）。
   * X/Esc → `cancel`。左侧 `customActions`（如 Apply）自行决定关窗、或结束 Promise。
   *
   * @param content 已构造的节点（或数组），不是路由组件名。
   * @param context 会话；选择器传 selectCtx，留给脚左侧 customActions。
   */
  dialog(
    content: TNode | TNode[],
    context: UiContext,
    props?: UiDialogProps<TNode>,
  ): Promise<UiDialogAction>

  /**
   * 实体编辑/新建弹窗。内容 = {@link buildEditView}。
   * 默认藏模块工具栏、底栏 okCancel；`onAccept` 由调用方在 `dlgProps` 传入（如 save）。
   */
  editDialog(
    context: UiContext,
    props?: UiEntityDialogOptions<TNode, UiViewProps>,
  ): Promise<UiDialogAction>

  /**
   * 实体详情弹窗（只读）。内容 = {@link buildDetailsView}。
   * 默认藏工具栏、无底栏；Esc / 点蒙层可关。
   */
  detailsDialog(
    context: UiContext,
    props?: UiEntityDialogOptions<TNode, UiViewProps>,
  ): Promise<UiDialogAction>

  /**
   * 实体选择弹窗。内容 = {@link buildSelectView}。
   * 归口原 `context.select` 的弹层实现。
   */
  selectDialog(
    context: UiContext,
    props?: UiEntityDialogOptions<TNode, UiListViewProps>,
  ): Promise<UiDialogAction>

  /**
   * 在已打开的实体对话框（如选择窗）上再叠一层创建/编辑/详情。
   * 保存成功后刷新 parent 列表并勾选该行；parent 窗不关。
   * `parent` 是列表会话（选择窗等），不必是 `UiContext<E>`。
   */
  openNestEntityDialog<E extends object = object>(
    parent: UiContext,
    view: 'create' | 'edit' | 'details',
    item?: E,
  ): Promise<{ action: UiDialogAction; entity?: E }>

  // —— App（壳走 UiLayout.scaffold；这里只产 nav 槽内容）——

  /**
   * 应用左侧菜单（一级轨 / 树 / compact 抽屉）。
   * 壳本身用 {@link UiLayout.scaffold}，不要 `buildAppScaffold`。
   * 内部用 `factory.sidebar` / `factory.drawer`，不要再包一层 Builder sidebar。
   */
  buildAppSideMenu(props: UiAppSideMenuProps<TNode>): TNode

  /**
   * 登录表单。路由页调本方法，不要 `factory.signinForm`。
   */
  buildSigninForm(
    props?: UiSigninFormProps,
    slots?: UiSigninFormSlots<TNode>,
  ): TNode

  /**
   * 注册表单。可选；未实现的皮肤可不提供。
   */
  buildSignupForm?(
    props?: UiSignupFormProps,
    slots?: UiSignupFormSlots<TNode>,
  ): TNode

  // —— Module（具名入口各管各的屏；各自拦 error / loading）——

  /**
   * 索引列表页。拦 error / loading 后拼 toolbar、filterbar、table。
   * categoryList / 插件页仍由本方法内部转 Explorer / Gantt 等。
   */
  buildIndexView(
    context: UiContext,
    props?: UiListViewProps,
  ): TNode

  /**
   * 选择器（selectOne / selectMany）。与 Index 同形，selectionMode 由 view 决定。
   */
  buildSelectView(
    context: UiContext,
    props?: UiListViewProps,
  ): TNode

  /**
   * 详情页（只读表单）。拦 error / loading 后拼 toolbar 与字段组。
   */
  buildDetailsView(
    context: UiContext,
    props?: UiViewProps,
  ): TNode

  /**
   * 编辑页。create 走同一方法，由 `context.view === create` 区分。
   */
  buildEditView(
    context: UiContext,
    props?: UiViewProps,
  ): TNode

  /**
   * 模块页工具栏（面包屑 + 动作 + 可选搜索）。
   */
  buildModuleToolbar(
    context: UiContext,
    props?: UiProps,
  ): TNode

  /**
   * 列表过滤条（工具栏与表格之间）。
   * 默认画列 FilterModel 芯片；`props.chips` 给快捷过滤等额外芯片预留。
   */
  buildFilterBar(
    context: UiContext,
    props?: UiFilterBarProps<TNode>,
  ): TNode

  // —— 页面组成块（可选；未 setXxxPlugin 时 throw）。不是整页 View ——

  /** 甘特。不进 UiFactory；实现转 ganttPlugin。 */
  buildGantt?(
    context: UiContext,
    props?: UiGanttProps,
  ): TNode

  /** 时间轴。嵌在屏里也可用 `factory.timeline`。 */
  buildTimeline?(
    context: UiContext,
    props?: UiTimelineProps,
  ): TNode

  /** 日程。 */
  buildScheduler?(
    context: UiContext,
    props?: UiSchedulerProps,
  ): TNode

  /** 看板。 */
  buildKanban?(
    context: UiContext,
    props?: UiKanbanProps,
  ): TNode

  /** 图。 */
  buildDiagram?(
    context: UiContext,
    props?: UiDiagramProps,
  ): TNode

  // —— 复杂组件（多块组合）——

  /**
   * 左树右表（分类浏览）。不是单控件，故留在 Builder。
   */
  buildExplorer<T>(
    context: UiContext,
    props?: UiExplorerProps<T, TNode>,
  ): TNode

  /**
   * 主表字段分组（`group.many === false`）。
   * 对每个可见字段调 `fieldFactory.render`（内含默认 layoutField）。
   * 不要一个方法兼管子表。
   */
  buildFieldGroup(
    group: MetaUiGroup,
    context: UiContext,
    props?: UiProps,
  ): TNode

  /**
   * 子表（`group.many === true`）。
   * 管 subGroupContext、组标题、增删行壳；内容直接 `factory.grid` / `factory.treeGrid`
   *（相册仍 `factory.imageGallery`）。不要再套 `buildGridView`。
   */
  buildSubGroup(
    group: MetaUiGroup,
    context: UiContext,
    props?: UiProps,
  ): TNode
}
