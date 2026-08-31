import { h, type Ref, type VNode, type VNodeChild } from 'vue'
import {
  daysBetween,
  friendlySeconds,
  isNullObject,
  relativeTime,
  type EntityListSearcher,
  type EntitySearchParam,
  type MetaUi,
  type MetaUiField,
  type MetaUiGroup,
  type MetaUiPack,
  type Module,
  type PagedList,
  type Pagination,
  type TranslateFn,
} from '@mmda/core'
import type { PropData, UiLayout, UiSlots } from './ui_layout'
import type { UiViewContext } from './ui_context'
import type {
  UiButtonProps,
  UiButtonSlots,
  UiLinkProps,
  UiLinkSlots,
  UiSplitButtonProps,
} from './ui_button'
import type { IconResolver, UiAction } from './ui_action'
import type { UiDialogPropsType } from './ui_dialog'
import type { SearchForRelativeProps } from './ui_filter'
import type { UiMenuItem } from './ui_menu'

type UiContext = UiViewContext<any>
import type {
  UiListColumnProps,
  UiListColumnSlots,
  UiListPropsType,
  UiPagableListPropsType,
  UiPaginatorPropsType,
  UiTableCellRenderer,
} from './ui_list'
import type { Rx } from '../rx'
import type { ChildSlot } from './ui_view'

export type { UiTableCellRenderer } from './ui_list'

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
  defaultFilterDisplay?: 'menu' | 'row' | 'none'
  actionIcons: Record<string, string>
  viewIcons: Record<string, string>
  dialogIcons: Record<string, string>
  resolveIcon: IconResolver
  textSpan: UiRenderer<string>
  label: UiRenderer<string>
  image: UiRenderer<string>
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
  list: <T>(model: T[], metaui: MetaUi, props: UiListPropsType<T>) => VNode
  table: <T>(model: T[], metaui: MetaUi, props: UiListPropsType<T>) => VNode
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
  searchForRelative: (
    props: SearchForRelativeProps | PropData,
    slots?: UiSlots,
  ) => VNode
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

export type UiFieldRenderer = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => VNode
export type UiGroupRenderer = (
  group: MetaUiGroup,
  context: UiContext,
  children?: VNode[],
  props?: PropData,
) => VNode

export interface UiFieldFactory extends Record<string, UiFieldRenderer> {
  fallbackDisplay: UiFieldRenderer
  fallbackInput: UiFieldRenderer
}

export const defineFieldProps = (field: MetaUiField): PropData => ({
  '.id': field.fieldName,
  '.name': field.fieldName,
  required: !field.nullable,
})

export const defineInputProps = (field: MetaUiField): PropData => ({
  '.id': field.fieldName,
  '.name': field.fieldName,
  maxlength: field.maxLength,
  required: !field.nullable,
  placeholder: field.placeholder,
})

/** 表格 cell renderer 不需要、也不应透传到 DOM 的 table 级 props */
export const TABLE_CELL_PROP_KEYS = [
  'groupUi',
  'cacheKey',
  'isSearch',
  'isTree',
  'readOnlyRows',
  'row',
  'group',
  'enableSort',
  'showGridlines',
  'renderCell',
  'gridCellRenderer',
  'gridCellRenderers',
  'tableMetaui',
  'onItemDoubleClick',
  'customCellRenderers',
  'onSort',
  'selectionMode',
  'showColumnFilters',
  'empty',
  'loadingSlot',
  'onFilterModelChange',
  'filterModel',
  'filterLabels',
  'onSelect',
  'onSelectionChange',
  'selectedItems',
  // DataTable / 列表级 props，勿透传到单元格 DOM
  'rowStyle',
  'rowClass',
  'striped',
  'stripedRows',
  'loading',
  'resizableColumns',
  'pagination',
  'pageSizeOptions',
  'onPage',
  'scrollable',
  'scrollHeight',
  'height',
  'maxHeight',
  'tableStyle',
  'size',
  'onRowClick',
  'onRowDblclick',
  'onRowContextmenu',
  'sortMode',
  'selection',
  'onUpdate:selection',
  'class',
  'value',
  'dataKey',
  'itemStyle',
  'itemClass',
  'itemKey',
  'onItemClick',
  'onItemSelect',
  'onSelectAll',
  'filterDisplay',
  'inplaceEdit',
  'showSummary',
  'showColumnWithAction',
  'showActions',
  'rowMenu',
  'itemHeight',
] as const

export const cleanProps = (
  unwantedKeys: readonly string[],
  props: PropData,
): PropData => {
  if (!props || isNullObject(props)) return {}
  const cleaned = Object.assign({}, props) as PropData
  for (const key of unwantedKeys) {
    delete cleaned[key]
  }
  return cleaned
}

/** 构造列级 cell renderer 时调用一次，勿在逐行循环里重复清理 */
export const cleanTableCellProps = (props: PropData = {}): PropData =>
  cleanProps(TABLE_CELL_PROP_KEYS, props)

export type { EntityListSearcher, Module, ChildSlot, UiDialogPropsType }
