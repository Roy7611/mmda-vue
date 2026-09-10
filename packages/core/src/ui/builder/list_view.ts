import type { UiSelectionMode } from '../context'
import type { UiBoxed, UiProps } from '../props'

/**
 * 模块列表页（Index / Select）拼屏 extras。
 * 工具栏已由 {@link import('../builder').UiBuilder.buildModuleToolbar} 吃掉；
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
