import { h, type Ref, type VNode, type VNodeChild } from 'vue'
import {
  daysBetween,
  friendlySeconds,
  relativeTime as formatRelativeTime,
  type EntitySearchParam,
  type MetaUi,
  type MetaUiPack,
  type Module,
  type PagedList,
  type Pagination,
  type TranslateFn,
  type UiButtonProps,
  type UiButtonSlots,
  type UiFactory as CoreUiFactory,
  type UiMenuItem,
  type UiMultiSelectProps,
} from '@mmda/core'
import type {UiProps, UiLayout, UiSlots} from '../layout/layout'
import type { IconResolver, UiAction } from './action'
import type { SearchForRelativeProps } from './filter'
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
export type { UiTableCellRenderer, UiFieldCellRenderer } from './list'
export type {
  UiAvatarProps,
  UiAvatarShape,
  UiAvatarSize,
  UiBadgeColor,
  UiBadgePosition,
  UiBadgeProps,
  UiBadgeShape,
  UiMessageProps,
  UiMessageVariant,
  UiDividerOrientation,
  UiDividerProps,
  UiSkeletonProps,
  UiSkeletonShape,
  UiSkeletonShimmer,
  UiBarcodeFormat,
  UiBarcodeProps,
  UiCodeCaption,
  UiCodeDisplayText,
  UiQrCodeFormat,
  UiQrCodeProps,
  UiBreadcrumbItem,
  UiBreadcrumbProps,
  AgAdvancedFilterModel,
  AgColumnAdvancedFilter,
  AgJoinAdvancedFilter,
  QueryBuilderRuleModel,
  UiQueryBuilderChoice,
  UiQueryBuilderColumn,
  UiQueryBuilderProps,
  UiQueryBuilderValueType,
} from '@mmda/core'
export type {
  UiCalendarDayCell,
  UiCalendarProps,
  UiCalendarSelection,
  UiCalendarValue,
  UiCalendarView,
} from './calendar'
export type {
  UiCarouselAnimation,
  UiCarouselItem,
  UiCarouselProps,
} from './carousel'
export type { UiChipItem, UiChipsKind, UiChipsProps } from './chips'
export type { UiContextMenuProps } from './context_menu'
export type {
  UiTooltipController,
  UiTooltipOpensOn,
  UiTooltipProps,
  UiTooltipSlots,
} from './tooltip'
export type { UiColorPickerMode, UiColorPickerProps } from './color_picker'
export type { UiMaskedTextBoxProps } from './masked_text_box'
export type {
  UiOneTimePasswordInputProps,
  UiOneTimePasswordType,
} from './one_time_password_input'
export type {
  UiSliderProps,
  UiSliderType,
  UiSliderValue,
} from './slider'
export type {
  UiRatingProps,
  UiRatingTemplate,
  UiRatingTemplateContext,
} from './rating'
export type {
  UiDrawerProps,
  UiSidebarPosition,
  UiSidebarProps,
  UiSidebarSlots,
  UiSidebarType,
} from './sidebar'
export type {
  UiNormalizedTabItem,
  UiTabHeader,
  UiTabItem,
  UiTabsHeaderPlacement,
  UiTabsHeightAdjustMode,
  UiTabsProps,
} from './tabs'
export type {
  UiToolbarLayout,
  UiToolbarProps,
  UiToolbarSlotName,
  UiToolbarSlots,
} from './toolbar'
export type {
  UiSplitterCollapseEvent,
  UiSplitterOrientation,
  UiSplitterPane,
  UiSplitterProps,
  UiSplitterResizeEvent,
} from './splitter'
export type {
  UiTimelineAlign,
  UiTimelineController,
  UiTimelineFieldOf,
  UiTimelineItem,
  UiTimelinePlugin,
  UiTimelineProps,
  UiTimelineRange,
  UiTimelineTimeDisplay,
} from './timeline'
export type { UiLoadingProps, UiLoadingSize } from '@mmda/core'
export type {
  UiSpeechToTextController,
  UiSpeechToTextProps,
} from './speech_to_text'
export type {
  UiDateInputProps,
  UiDatePickerProps,
  UiDatePrecision,
  UiDateShortcut,
  UiDateShortcutKind,
} from './date_picker'
export type {
  UiTreeSelectDisplay,
  UiTreeSelectLoadMode,
  UiTreeSelectProps,
  UiTreeSelectValue,
} from './tree_select'
export type {
  UiDropDownButtonPlacement,
  UiDropDownButtonProps,
} from '@mmda/core'
export type { UiSplitButtonProps } from './split_button'
export type {
  UiFabPosition,
  UiFloatingActionButtonProps,
} from './floating_action_button'

export type UiRenderer<T = any> = (
  model: T,
  props?: UiProps,
  slots?: UiSlots,
) => VNode

export type UiButtonRenderer = (
  props: UiButtonProps,
  slots?: UiButtonSlots<VNode>,
) => VNode

export type { UiImageGalleryItem } from '@mmda/core'

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

export const previewList = ['xlsx', 'docx', 'xls', 'doc']

export interface UiFactory extends CoreUiFactory<VNode> {
  [index: string]: any
  layout: UiLayout
  actionIcons: Record<string, string>
  viewIcons: Record<string, string>
  dialogIcons: Record<string, string>
  resolveIcon: IconResolver
  textSpan: UiRenderer<string>
  label: UiRenderer<string>
  image: UiRenderer<string>
  icon: UiRenderer<string>
  title: UiRenderer<string>
  subtitle: UiRenderer<string>
  iconField: UiRenderer<string>
  multiItemSelect: (props: UiMultiSelectProps) => VNode
  multiValueSelect: (props: UiMultiSelectProps) => VNode
  multiTextSelect: (props: UiMultiSelectProps) => VNode
  multiBitSelect: (props: UiMultiSelectProps) => VNode
  actionButton: (
    action: UiAction,
    t: TranslateFn,
    resolve?: boolean,
    props?: UiProps,
  ) => VNode
  paginator: (
    model: Pagination,
    props: UiPaginatorPropsType & UiProps,
    slots?: UiSlots,
  ) => VNode
  list: <T>(model: T[], metaUi: MetaUi, props?: UiListPropsType<T>) => VNode
  tree: <T>(props: UiTreePropsType<T>) => VNode
  table: <T>(model: T[], metaUi: MetaUi, props?: UiListPropsType<T>) => VNode
  grid?: <T>(model: T[], metaUi: MetaUi, props?: UiListPropsType<T>) => VNode
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
  scrollbar: UiRenderer<VNodeChild>
  menu: UiRenderer<UiMenuItem[] | any[]>
  panelMenu: UiRenderer<UiMenuItem[] | any[]>
  menubar: UiRenderer<UiMenuItem[] | any[]>
  searchForRelative: (
    props: SearchForRelativeProps | UiProps,
    slots?: UiSlots,
  ) => VNode
  formField: (props: UiProps, slots?: UiSlots) => VNode
}

/** core UiFactory 钉成 VNode；仅补图标表、pagableTable、menu 等 Vue 会话件。 */
export type VueUiFactory = UiFactory

export const durationOfSeconds: UiRenderer<number> = (seconds, props) =>
  h('span', props, () => friendlySeconds(seconds, props?.locale as string | undefined))
export const durationOfDays: UiRenderer<string[]> = (dates, props) =>
  h('span', props, () => daysBetween(dates[0], dates[1], props?.locale as string | undefined))
export const relativeTime: UiRenderer<string> = (sqlDateTime, props) =>
  h('span', props, () => formatRelativeTime(sqlDateTime, props?.locale as string | undefined))
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

export type { Module, ChildSlot }
