import { h, type Ref, type VNode, type VNodeChild } from 'vue'
import {
  daysBetween,
  friendlySeconds,
  relativeTime as formatRelativeTime,
  type EntitySearchParam,
  type MetaUi,
  type Module,
  type PagedList,
  type TranslateFn,
  type UiButtonProps,
  type UiButtonSlots,
  type UiFactory,
  type UiIconProps,
  type UiImageProps,
  type UiMenuItem,
  type UiMultiSelectProps,
  type UiSearchRefProps,
  type UiTextProps,
  type UiPaginatorProps,
} from '@mmda/core'
import type {VuiTileSlots} from './layout'
import type { UiProps, UiLayout } from '@mmda/core'
import type { IconResolver, UiAction } from './factory/action'
import type {
  VuiListColumnProps,
  VuiListColumnSlots,
  VuiListPropsType,
  VuiPagableListPropsType,
} from './factory/list'
import type { UiTreeProps } from './factory/tree'
import type { VuiTreeGridPropsType } from './factory/tree_grid'
import type { Rx } from '../rx'
import type { ChildSlot } from '../contexts/view'

export * from './field_factory'
export type { VuiTableCellRenderer, UiFieldCellRenderer } from './factory/list'
export type {
  UiAvatarProps,
  UiAvatarShape,
  UiAvatarSize,
  UiBadgeColor,
  UiBadgePosition,
  UiBadgeProps,
  UiBadgeShape,
  UiErrorProps,
  UiErrorStatus,
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
} from './factory/calendar'
export type {
  UiCarouselAnimation,
  UiCarouselItem,
  UiCarouselProps,
} from './factory/carousel'
export type { UiChipItem, UiChipsKind, UiChipsProps } from './factory/chips'
export type { UiContextMenuProps } from './factory/context_menu'
export type {
  UiTooltipController,
  UiTooltipOpensOn,
  UiTooltipProps,
  UiTooltipSlots,
} from './factory/tooltip'
export type { UiColorPickerMode, UiColorPickerProps } from './factory/color_picker'
export type { UiMaskedTextBoxProps } from './factory/masked_text_box'
export type {
  UiOneTimePasswordInputProps,
  UiOneTimePasswordType,
} from './factory/one_time_password_input'
export type {
  UiSliderProps,
  UiSliderType,
  UiSliderValue,
} from './factory/slider'
export type {
  UiRatingProps,
  UiRatingTemplate,
  UiRatingTemplateContext,
} from './factory/rating'
export type {
  UiDrawerProps,
  UiSidebarPosition,
  UiSidebarProps,
  UiSidebarType,
} from './factory/sidebar'
export type {
  VuiNormalizedTabItem,
  UiTabHeader,
  UiTabItem,
  UiTabsHeaderPlacement,
  UiTabsHeightAdjustMode,
  UiTabsProps,
} from './factory/tabs'
export type {
  UiToolbarProps,
  UiToolbarRegions,
  UiToolbarSlotName,
  UiToolbarSlots,
} from './factory/toolbar'
export type {
  UiSplitterCollapseEventArgs,
  UiSplitterOrientation,
  UiSplitterPane,
  UiSplitterProps,
  UiSplitterResizeEventArgs,
} from './factory/splitter'
export type { UiLoadingProps, UiLoadingSize } from '@mmda/core'
export type {
  UiSpeechToTextController,
  UiSpeechToTextProps,
} from './factory/speech_to_text'
export type {
  UiDateInputProps,
  UiDatePickerProps,
  UiDatePrecision,
  UiDateShortcut,
  UiDateShortcutKind,
} from './factory/date_picker'
export type {
  UiTreeSelectDisplay,
  UiTreeSelectLoadMode,
  UiTreeSelectProps,
  UiTreeSelectValue,
} from './factory/tree_select'
export type {
  UiDropDownButtonPlacement,
  UiDropDownButtonProps,
} from '@mmda/core'
export type { VuiSplitButtonProps } from './factory/split_button'
export type {
  UiFabPosition,
  UiFloatingActionButtonProps,
} from './factory/floating_action_button'

export type VuiRenderer<T = any> = (
  model: T,
  props?: UiProps,
  slots?: VuiTileSlots,
) => VNode

export type VuiButtonRenderer = (
  props: UiButtonProps,
  slots?: UiButtonSlots<VNode>,
) => VNode

export type { UiImageGalleryItem, UiImageGalleryProps } from '@mmda/core'

export interface CustomColumn {
  field: string
  header: string
  width?: number
  maxWidth?: number
  aggregation?: boolean
  frozen?: 'left' | 'right'
}

export interface VuiPagableDataLoader<T = any> {
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

export interface VuiFactory extends UiFactory<VNode> {
  [index: string]: any
  actionIcons: Record<string, string>
  viewIcons: Record<string, string>
  dialogIcons: Record<string, string>
  resolveIcon: IconResolver
  textSpan: (props: UiTextProps) => VNode
  label: (props: UiTextProps) => VNode
  image: (props: UiImageProps) => VNode
  icon: (props: UiIconProps) => VNode
  title: (props: UiTextProps) => VNode
  subtitle: (props: UiTextProps) => VNode
  iconField: VuiRenderer<string>
  multiItemSelect: (props: UiMultiSelectProps) => VNode
  multiValueSelect: (props: UiMultiSelectProps) => VNode
  multiTextSelect: (props: UiMultiSelectProps) => VNode
  multiBitSelect: (props: UiMultiSelectProps) => VNode
  actionButton: (
    action: UiAction,
    t: TranslateFn,
    resolve?: boolean,
    props?: UiButtonProps,
  ) => VNode
  paginator: (props: UiPaginatorProps, slots?: VuiTileSlots) => VNode
  list: <T>(props: VuiListPropsType<T>) => VNode
  tree: <T>(props: UiTreeProps<T>) => VNode
  table: <T>(props: VuiListPropsType<T>) => VNode
  grid: <T>(props: VuiListPropsType<T>) => VNode
  treeGrid: <T>(props: VuiTreeGridPropsType<T>) => VNode
  pagableTable: <T>(
    dataLoader: VuiPagableDataLoader<T>,
    metadata: MetaUi,
    props: VuiPagableListPropsType<T>,
  ) => VNode
  scrollbar: VuiRenderer<VNodeChild>
  menu: VuiRenderer<UiMenuItem[] | any[]>
  panelMenu: VuiRenderer<UiMenuItem[] | any[]>
  menubar: VuiRenderer<UiMenuItem[] | any[]>
  searchRelative: (props: UiSearchRefProps, slots?: VuiTileSlots) => VNode
  formField: (props: UiProps, slots?: VuiTileSlots) => VNode
}

export const durationOfSeconds: VuiRenderer<number> = (seconds, props) =>
  h('span', props, () => friendlySeconds(seconds, (props as { locale?: string } | undefined)?.locale))
export const durationOfDays: VuiRenderer<string[]> = (dates, props) =>
  h('span', props, () => daysBetween(dates[0], dates[1], (props as { locale?: string } | undefined)?.locale))
export const relativeTime: VuiRenderer<string> = (sqlDateTime, props) =>
  h('span', props, () => formatRelativeTime(sqlDateTime, (props as { locale?: string } | undefined)?.locale))
export const label: VuiRenderer<string> = (text, props) =>
  h('label', props, text)
export const faIcon: VuiRenderer<string> = (iconClass, props) =>
  h('i', { class: iconClass, ...props })
export const fasIcon: VuiRenderer<string> = (name, props) =>
  h('i', { class: `fas fa-${name}`, ...props })
export const farIcon: VuiRenderer<string> = (name, props) =>
  h('i', { class: `far fa-${name}`, ...props })
export const fabIcon: VuiRenderer<string> = (name, props) =>
  h('i', { class: `fab fa-${name}`, ...props })
export const fadIcon: VuiRenderer<string> = (name, props) =>
  h('i', { class: `fad fa-${name}`, ...props })

export type { Module, ChildSlot }
