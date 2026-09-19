import type { UiSelectionMode } from '../context'
import type { UiBoxed, UiProps } from '../props'

/**
 * 模块列表页（Index / Select）拼屏 extras。
 * 工具栏已由 {@link import('../builder').UiBuilder.buildIndexTopbar} 吃掉；
 * 数据区直接 `factory.table|grid|list|treeGrid`，不要再套 `buildListView`。
 */
export interface UiListViewProps extends UiProps {
  /** 是否显示模块工具栏。缺省 true。 */
  showToolbar?: boolean
  /** 是否显示搜索条（可嵌在工具栏中）。缺省 true。 */
  showSearchbar?: boolean
  /** 是否显示面包屑。缺省 true。 */
  showBreadcrumb?: boolean
  /** 勾选模式；Select 视图由 context.view 决定时可省略。 */
  selectionMode?: UiSelectionMode
  /** 列表查询中。 */
  loading?: UiBoxed<boolean>
  /**
   * 数据区形态。缺省由 editable / viewKind 决定：
   * 只读 → table；可编 → grid；树 → treeGrid；移动端卡片 → list。
   */
  display?: 'list' | 'table' | 'grid' | 'treeGrid'
}

/**
 * 模块 **index** 工作区保活：进详情/编辑再回来时，就地改行而不整表重绑。
 *
 * 只有列表页需要。selector / 子表不要接。叠层揭开不要 select、不要动虚拟滚动
 * （不要 capture/restore 像素滚动，skip 会错位白屏）。
 *
 * 皮肤在表格挂上后调 Builder 注入的 `onIndexTableHostReady(host)`；销毁时传 `null`。
 * 该回调在皮肤 extras，不进程序员 {@link import('../factory/table').UiTableProps}。
 */
export interface UiIndexTableHost {
  /** 按主键把这一行写回当前窗口（换 dataSource 新引用；不要 setRowData）。 */
  applyRow(entity: Record<string, unknown>): void
  /** Create 保存：插到第 0 行并滚到顶。 */
  insertAtZero(entity: Record<string, unknown>): void
  /** 按 id 从当前窗口去掉一行。 */
  applyRemove(id: string): void
  /** 搜索 / 翻页后 list 已 splice：就地换 dataSource，不要重建 Grid。 */
  rebind(): void
}
