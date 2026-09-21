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
} from '@mmda/core'
import type {UiProps, UiLayout, UiSlots} from './layout'
import type { IconResolver, UiAction } from './factory/action'
import type {
  UiListColumnProps,
  UiListColumnSlots,
  UiListPropsType,
  UiPagableListPropsType,
  UiPaginatorPropsType,
} from './factory/list'
import type { UiTreeProps } from './factory/tree'
import type { UiTreeGridPropsType } from './factory/tree_grid'
import type { Rx } from '../rx'
import type { ChildSlot } from '../contexts/view'

export * from './field_factory'
export type { UiTableCellRenderer, UiFieldCellRenderer } from './factory/list'
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
  UiSidebarSlots,
  UiSidebarType,
} from './factory/sidebar'
export type {
  UiNormalizedTabItem,
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
export type { UiSplitButtonProps } from './factory/split_button'
export type {
  UiFabPosition,
  UiFloatingActionButtonProps,
} from './factory/floating_action_button'

export type UiRenderer<T = any> = (
  model: T,
  props?: UiProps,
  slots?: UiSlots,
) => VNode

export type UiButtonRenderer = (
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

export interface VueUiFactory extends UiFactory<VNode> {
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
  iconField: UiRenderer<string>
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
  paginator: (props: UiPaginatorPropsType, slots?: UiSlots) => VNode
  list: <T>(props: UiListPropsType<T>) => VNode
  tree: <T>(props: UiTreeProps<T>) => VNode
  table: <T>(props: UiListPropsType<T>) => VNode
  grid: <T>(props: UiListPropsType<T>) => VNode
  treeGrid: <T>(props: UiTreeGridPropsType<T>) => VNode
  pagableTable: <T>(
    dataLoader: UiPagableDataLoader<T>,
    metadata: MetaUi,
    props: UiPagableListPropsType<T>,
  ) => VNode
  scrollbar: UiRenderer<VNodeChild>
  menu: UiRenderer<UiMenuItem[] | any[]>
  panelMenu: UiRenderer<UiMenuItem[] | any[]>
  menubar: UiRenderer<UiMenuItem[] | any[]>
  searchRelative: (props: UiSearchRefProps, slots?: UiSlots) => VNode
  formField: (props: UiProps, slots?: UiSlots) => VNode
}

export const durationOfSeconds: UiRenderer<number> = (seconds, props) =>
  h('span', props, () => friendlySeconds(seconds, (props as { locale?: string } | undefined)?.locale))
export const durationOfDays: UiRenderer<string[]> = (dates, props) =>
  h('span', props, () => daysBetween(dates[0], dates[1], (props as { locale?: string } | undefined)?.locale))
export const relativeTime: UiRenderer<string> = (sqlDateTime, props) =>
  h('span', props, () => formatRelativeTime(sqlDateTime, (props as { locale?: string } | undefined)?.locale))
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
