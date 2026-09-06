import { h, type Ref, type VNode, type VNodeChild } from 'vue'
import {
  daysBetween,
  friendlySeconds,
  relativeTime,
  type EntitySearchParam,
  type MetaUi,
  type MetaUiPack,
  type Module,
  type PagedList,
  type Pagination,
  type TranslateFn,
} from '@mmda/core'
import type { PropData, UiLayout, UiSlots } from '../layout/layout'
import type {
  UiButtonProps,
  UiButtonSlots,
  UiLinkProps,
  UiLinkSlots,
  UiSplitButtonProps,
} from './button'
import type { IconResolver, UiAction } from './action'
import type { UiDialogPropsType } from './dialog'
import type { SearchForRelativeProps } from './filter'
import type { UiMenuItem } from './menu'
import type {
  UiListColumnProps,
  UiListColumnSlots,
  UiListPropsType,
  UiPagableListPropsType,
  UiPaginatorPropsType,
  UiTableCellRenderer,
} from './list'
import type { UiTreePropsType } from './tree'
import type { UiTreeGridPropsType } from './tree_grid'
import type { Rx } from '../../rx'
import type { ChildSlot } from '../../contexts/view'

export * from './field_factory'
export type { UiTableCellRenderer } from './list'

export interface UiSplitterPane {
  content: VNode
  /** 初始尺寸，如 `16rem` / `25%`。对应 SF `paneSettings.size`。 */
  size?: string
  /** 对应 `paneSettings.min`。 */
  min?: string
  /** 对应 `paneSettings.max`。 */
  max?: string
  /** 分隔条上显示折叠/展开图标。对应 `paneSettings.collapsible`。 */
  collapsible?: boolean
  /** 初始是否已折叠。对应 `paneSettings.collapsed`。 */
  collapsed?: boolean
  /** 对应 `paneSettings.resizable`。 */
  resizable?: boolean
  cssClass?: string
}

export interface UiSplitterCollapseEvent {
  index: number
  collapsed: boolean
}

export interface UiSplitterProps {
  orientation?: 'Horizontal' | 'Vertical'
  class?: string
  width?: string
  height?: string
  /** 对应 SF `separatorSize`。 */
  separatorSize?: number
  /** 程序化收起第 0 栏（模糊搜索）。不要写 paneSettings.collapsed。 */
  collapseTick?: number
  onCollapsed?: (event: UiSplitterCollapseEvent) => void
  onExpanded?: (event: UiSplitterCollapseEvent) => void
}

export type UiRenderer<T = any> = (
  model: T,
  props?: PropData,
  slots?: UiSlots,
) => VNode

export type UiButtonRenderer = (
  props: UiButtonProps,
  slots?: UiButtonSlots,
) => VNode

export interface UiBadgeProps extends PropData {
  value: string | number
  severity?: 'info' | 'success' | 'warning' | 'danger'
}

export interface UiImageGalleryItem {
  src: string
  thumbnail?: string
  alt?: string
  title?: string
  description?: string
  data?: unknown
}

export interface CustomColumn {
  field: string
  header: string
  width?: number
  maxWidth?: number
  aggregation?: boolean
  frozen?: 'left' | 'right'
}

export interface UiPagableDataLoader<T = any> {
  searchParam: Rx<EntitySearchParam>
  model: Rx<PagedList<T>>
  loading: Ref<boolean>
  error: Ref<string>
}

export interface UploadFile {
  fileName?: string
  fileExt?: string
  fileIcon?: string
  fileUrl?: string
  fileSize?: string
  uploadTime?: string
  uploader?: string
}

export const previewList = ['xlsx', 'docx', 'pdf', 'bmp', 'jpg', 'png', 'gif']

export interface UiFactory {
  [index: string]: any
  layout: UiLayout
  /** 表格控件本身承载分页器，buildListView 不再创建独立 paginator。 */
  integratedTablePaging?: boolean
  /** 表格组件原生支持单元格编辑（如 Syncfusion EJ2 Batch）。 */
  nativeInplaceEdit?: boolean
  defaultFilterDisplay?: 'menu' | 'row' | 'none'
  actionIcons: Record<string, string>
  viewIcons: Record<string, string>
  dialogIcons: Record<string, string>
  resolveIcon: IconResolver
  textSpan: UiRenderer<string>
  label: UiRenderer<string>
  image: UiRenderer<string>
  imageGallery?: UiRenderer<UiImageGalleryItem[]>
  filesUploader?: (props: PropData) => VNode
  icon: UiRenderer<string>
  badge: (props: UiBadgeProps) => VNode
  title: UiRenderer<string>
  subtitle: UiRenderer<string>
  link: (props: UiLinkProps, slots?: UiLinkSlots) => VNode
  input: UiRenderer<string>
  iconField: UiRenderer<string>
  dropdown: UiRenderer<any>
  button: UiButtonRenderer
  buttonGroup: (buttons: () => VNode[], props?: PropData) => VNode
  splitButton: (props: UiSplitButtonProps, slots?: UiSlots) => VNode
  menuButton: (
    buttonProps: UiButtonProps,
    actions: UiAction[],
    slots?: UiSlots,
  ) => VNode
  floatingActionButton: (props: UiSplitButtonProps) => VNode
  selectButton: (value: any, props: PropData, slots?: UiSlots) => VNode
  actionButton: (
    action: UiAction,
    t: TranslateFn,
    resolve?: boolean,
    props?: PropData,
  ) => VNode
  paginator: (
    model: Pagination,
    props: UiPaginatorPropsType & PropData,
    slots?: UiSlots,
  ) => VNode
  list: <T>(model: T[], metaUi: MetaUi, props: UiListPropsType<T>) => VNode
  tree: <T>(props: UiTreePropsType<T>) => VNode
  table: <T>(model: T[], metaUi: MetaUi, props?: UiListPropsType<T>) => VNode
  treeGrid: <T>(
    model: T[],
    metaUi: MetaUi,
    props: UiTreeGridPropsType<T>,
  ) => VNode
  pagableTable: <T>(
    dataLoader: UiPagableDataLoader<T>,
    metadata: MetaUiPack,
    props: UiPagableListPropsType<T>,
  ) => VNode
  loading?: (props?: PropData, slots?: any) => VNode
  scrollbar: UiRenderer<VNodeChild>
  menu: UiRenderer<UiMenuItem[] | any[]>
  panelMenu: UiRenderer<UiMenuItem[] | any[]>
  menubar: UiRenderer<UiMenuItem[] | any[]>
  dialog: (
    props: PropData & {
      visible: boolean
      onUpdateVisible: (value: boolean) => void
    },
    slots?: UiSlots,
  ) => VNode
  drawer: (props: PropData, slots?: UiSlots) => VNode
  splitter: (panes: UiSplitterPane[], props?: UiSplitterProps) => VNode
  searchForRelative: (
    props: SearchForRelativeProps | PropData,
    slots?: UiSlots,
  ) => VNode
  formItem?: (props: PropData, slots?: UiSlots) => VNode
  column?: (props: PropData, slots?: UiSlots) => any
  dataTable?: (data: any[], columns: any[], props?: PropData) => VNode
  /** @deprecated 使用 dataTable */
  primeVueTable?: (data: any[], columns: any[], props?: PropData) => VNode
  datePicker?: (props: PropData) => VNode
  numberInput?: (props: PropData) => VNode
  select?: (props: PropData) => VNode
  toggleSwitch?: (value: any, props?: PropData) => VNode
  textarea?: (value: any, props?: PropData) => VNode
  dataViewBox?: (props: PropData, slots?: UiSlots) => VNode
}

export interface TabsSlots {
  tabs: VNode[]
  tabPanels: VNode[]
}

/** @deprecated 使用 UiFactory；chrome 方法已并入基接口。 */
export type PrimeVueUiFactory = UiFactory
export type SyncfusionUiFactory = UiFactory

export const durationOfSeconds: UiRenderer<number> = (seconds, props) =>
  h('span', props, () => friendlySeconds(seconds, props?.locale))
export const durationOfDays: UiRenderer<string[]> = (dates, props) =>
  h('span', props, () => daysBetween(dates[0], dates[1], props?.locale))
export const pastTime: UiRenderer<string> = (sqlDateTime, props) =>
  h('span', props, () => relativeTime(sqlDateTime, props?.locale))
export const label: UiRenderer<string> = (text, props) =>
  h('label', props, text)
export const faIcon: UiRenderer<string> = (iconClass, props) =>
  h('i', { class: iconClass, ...props })
export const fasIcon: UiRenderer<string> = (name, props) =>
  h('i', { class: `fas fa-${name}`, ...props })
export const farIcon: UiRenderer<string> = (name, props) =>
  h('i', { class: `far fa-${name}`, ...props })
export const fabIcon: UiRenderer<string> = (name, props) =>
  h('i', { class: `fab fa-${name}`, ...props })
export const fadIcon: UiRenderer<string> = (name, props) =>
  h('i', { class: `fad fa-${name}`, ...props })

export type { Module, ChildSlot, UiDialogPropsType }
