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
} from '@mmda/core'
import type { PropData, UiLayout, UiSlots } from '../layout/layout'
import type {
  UiButtonGroupProps,
  UiButtonProps,
  UiButtonSlots,
  UiLinkProps,
  UiLinkSlots,
  UiSelectButtonGroupProps,
} from './button'
import type { UiDropDownButtonProps } from './drop_down_button'
import type { UiSplitButtonProps } from './split_button'
import type { UiFloatingActionButtonProps } from './floating_action_button'
import type { IconResolver, UiAction } from './action'
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
import type { UiBadgeProps } from './badge'
import type { UiAvatarProps } from './avatar'
import type { UiAutoCompleteProps } from './autocomplete'
import type { UiBarcodeProps } from './barcode'
import type { UiQrCodeProps } from './qrcode'
import type { UiBreadcrumbProps } from './breadcrumb'
import type { UiCalendarProps } from './calendar'
import type { UiCarouselProps } from './carousel'
import type { UiCheckBoxProps } from './checkbox'
import type { UiSwitchProps } from './switch'
import type { UiChipsProps } from './chips'
import type { UiContextMenuProps } from './context_menu'
import type { UiCardProps, UiCardSlots } from './card'
import type { UiDividerProps } from './divider'
import type { UiTooltipProps, UiTooltipSlots } from './tooltip'
import type {
  UiInplaceEditorProps,
  UiInplaceEditorSlots,
} from './inplace_editor'
import type { UiFileLinkProps } from './file_link'
import type {
  UiFileUploaderProps,
  UiFilesUploaderProps,
} from './file_uploader'
import type {
  UiImageUploaderProps,
  UiImagesUploaderProps,
} from './image_uploader'
import type { UiColorPickerProps } from './color_picker'
import type { UiMaskedTextBoxProps } from './masked_text_box'
import type { UiOneTimePasswordInputProps } from './one_time_password_input'
import type { UiQueryBuilderProps } from './query_builder'
import type { UiSliderProps } from './slider'
import type { UiRatingProps } from './rating'
import type { UiSidebarProps, UiSidebarSlots } from './sidebar'
import type { UiTabsProps } from './tabs'
import type { UiToolbarProps, UiToolbarSlots } from './toolbar'
import type { UiSplitterPane, UiSplitterProps } from './splitter'
import type { UiNumberInputProps } from './number_input'
import type { UiTextAreaProps } from './text_area'
import type { UiTextInputProps } from './text_input'
import type { UiProgressBarProps } from './progress_bar'
import type { UiSignaturePadProps } from './signature_pad'
import type { UiStepperProps } from './stepper'
import type { UiTimelineProps } from './timeline'
import type { UiSkeletonProps } from './skeleton'
import type { UiLoadingProps } from './loading'
import type { UiSpeechToTextProps } from './speech_to_text'
import type { UiDatePickerProps } from './date_picker'
import type { UiDateTimePickerProps } from './date_time_picker'
import type { UiTimePickerProps } from './time_picker'
import type { UiDateRangePickerProps } from './date_range_picker'
import type { UiDropDownListProps } from './drop_down_list'
import type { UiRadioButtonGroupProps } from './radio_button_group'
import type { UiMultiSelectProps } from './multi_select'
import type { UiCheckBoxListProps } from './check_box_list'
import type { UiTagAutoCompleteProps } from './tag_auto_complete'
import type { UiTreeSelectProps } from './tree_select'
import type { UiComboBoxProps } from './combo_box'

export * from './field_factory'
export type { UiTableCellRenderer } from './list'
export type {
  UiAvatarProps,
  UiAvatarShape,
  UiAvatarSize,
} from './avatar'
export type {
  UiBadgeColor,
  UiBadgePosition,
  UiBadgeProps,
  UiBadgeShape,
} from './badge'
export type {
  UiAutoCompleteOption,
  UiAutoCompleteProps,
  UiAutoCompleteSize,
  UiAutoCompleteSuggest,
} from './autocomplete'
export type {
  UiBarcodeFormat,
  UiBarcodeProps,
  UiCodeCaption,
  UiCodeDisplayText,
} from './barcode'
export type { UiQrCodeFormat, UiQrCodeProps } from './qrcode'
export type { UiBreadcrumbItem, UiBreadcrumbProps } from './breadcrumb'
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
export type { UiCheckBoxProps } from './checkbox'
export type { UiSwitchProps } from './switch'
export type { UiCheckBoxListProps } from './check_box_list'
export type {
  UiMultiSelectBindMode,
  UiMultiSelectDisplay,
  UiMultiSelectProps,
} from './multi_select'
export type { UiTagAutoCompleteProps } from './tag_auto_complete'
export type { UiChipItem, UiChipsKind, UiChipsProps } from './chips'
export type { UiContextMenuProps } from './context_menu'
export type { UiCardProps, UiCardSlots, UiCardSurface } from './card'
export type { UiDividerOrientation, UiDividerProps } from './divider'
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
  AgAdvancedFilterModel,
  AgColumnAdvancedFilter,
  AgJoinAdvancedFilter,
  QueryBuilderRuleModel,
  UiQueryBuilderChoice,
  UiQueryBuilderColumn,
  UiQueryBuilderProps,
  UiQueryBuilderValueType,
} from './query_builder'
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
export type { UiNumberInputKind, UiNumberInputProps } from './number_input'
export type {
  UiTextAreaProps,
  UiTextAreaResizeMode,
} from './text_area'
export type {
  UiProgressBarKind,
  UiProgressBarProps,
  UiProgressBarSize,
} from './progress_bar'
export type {
  UiSignaturePadAction,
  UiSignaturePadBeforeSave,
  UiSignaturePadController,
  UiSignaturePadFileType,
  UiSignaturePadProps,
} from './signature_pad'
export type {
  UiStepperAnimation,
  UiStepperChanging,
  UiStepperController,
  UiStepperDisplay,
  UiStepperFieldOf,
  UiStepperItem,
  UiStepperLabelPosition,
  UiStepperProps,
  UiStepperStatus,
} from './stepper'
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
export type {
  UiSkeletonProps,
  UiSkeletonShape,
  UiSkeletonShimmer,
} from './skeleton'
export type { UiLoadingProps, UiLoadingSize } from './loading'
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
export type { UiDateTimePickerProps } from './date_time_picker'
export type { UiTimePickerProps } from './time_picker'
export type {
  UiDateRangePickerProps,
  UiDateRangeValue,
} from './date_range_picker'
export type {
  UiSelectOption,
  UiSelectSuggest,
  UiDropDownListProps,
} from './drop_down_list'
export type { UiRadioButtonGroupProps } from './radio_button_group'
export type {
  UiTreeSelectDisplay,
  UiTreeSelectLoadMode,
  UiTreeSelectProps,
  UiTreeSelectValue,
} from './tree_select'
export type { UiComboBoxProps } from './combo_box'
export type {
  UiDropDownButtonPlacement,
  UiDropDownButtonProps,
} from './drop_down_button'
export type { UiSplitButtonProps } from './split_button'
export type {
  UiFabPosition,
  UiFloatingActionButtonProps,
} from './floating_action_button'

export type UiRenderer<T = any> = (
  model: T,
  props?: PropData,
  slots?: UiSlots,
) => VNode

export type UiButtonRenderer = (
  props: UiButtonProps,
  slots?: UiButtonSlots,
) => VNode

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

export const previewList = ['xlsx', 'docx', 'xls', 'doc']

export interface UiFactory {
  [index: string]: any
  layout: UiLayout
  /** 表格组件原生支持单元格编辑（桌面皮肤 true；移动端可 false）。 */
  nativeInplaceEdit?: boolean
  actionIcons: Record<string, string>
  viewIcons: Record<string, string>
  dialogIcons: Record<string, string>
  resolveIcon: IconResolver
  textSpan: UiRenderer<string>
  label: UiRenderer<string>
  image: UiRenderer<string>
  imageGallery?: UiRenderer<UiImageGalleryItem[]>
  fileLink: (props: UiFileLinkProps) => VNode
  fileUploader: (props?: UiFileUploaderProps) => VNode
  filesUploader: (props?: UiFilesUploaderProps) => VNode
  imageUploader: (props?: UiImageUploaderProps) => VNode
  imagesUploader: (props?: UiImagesUploaderProps) => VNode
  icon: UiRenderer<string>
  badge: (props: UiBadgeProps) => VNode
  avatar: (props: UiAvatarProps) => VNode
  barcode: (props: UiBarcodeProps) => VNode
  qrCode: (props: UiQrCodeProps) => VNode
  breadcrumb: (props: UiBreadcrumbProps) => VNode
  calendar: (props: UiCalendarProps) => VNode
  carousel: (props: UiCarouselProps) => VNode
  checkBox: (props: UiCheckBoxProps) => VNode
  switch: (
    value?: boolean | UiSwitchProps,
    props?: UiSwitchProps,
  ) => VNode
  checkBoxList: (props: UiCheckBoxListProps) => VNode
  bitCheckBoxList: (props: UiCheckBoxListProps) => VNode
  chips: (props: UiChipsProps) => VNode
  contextMenu: (props: UiContextMenuProps) => VNode
  card: (props: UiCardProps, slots?: UiCardSlots) => VNode
  divider: (props?: UiDividerProps) => VNode
  tooltip: (props: UiTooltipProps, slots?: UiTooltipSlots) => VNode
  inplaceEditor: (
    props?: UiInplaceEditorProps,
    slots?: UiInplaceEditorSlots,
  ) => VNode
  colorPicker: (props: UiColorPickerProps) => VNode
  maskedTextBox: (props: UiMaskedTextBoxProps) => VNode
  oneTimePasswordInput: (props: UiOneTimePasswordInputProps) => VNode
  queryBuilder: (props: UiQueryBuilderProps) => VNode
  slider: (props: UiSliderProps) => VNode
  rating: (props: UiRatingProps) => VNode
  sidebar: (props: UiSidebarProps, slots?: UiSidebarSlots) => VNode
  tabs: (props: UiTabsProps) => VNode
  toolbar: (props: UiToolbarProps, slots?: UiToolbarSlots) => VNode
  numberInput: (props: UiNumberInputProps) => VNode
  textInput: (props: UiTextInputProps) => VNode
  textArea: (props: UiTextAreaProps) => VNode
  progressBar: (props: UiProgressBarProps) => VNode
  signaturePad: (props: UiSignaturePadProps) => VNode
  stepper: (props: UiStepperProps) => VNode
  timeline: (props: UiTimelineProps) => VNode
  skeleton: (props?: UiSkeletonProps) => VNode
  loading: (props?: UiLoadingProps) => VNode
  speechToText: (props?: UiSpeechToTextProps) => VNode
  datePicker: (props: UiDatePickerProps) => VNode
  monthPicker: (props: UiDatePickerProps) => VNode
  dateTimePicker: (props: UiDateTimePickerProps) => VNode
  timePicker: (props: UiTimePickerProps) => VNode
  dateRangePicker: (props: UiDateRangePickerProps) => VNode
  dropDownList: (props: UiDropDownListProps) => VNode
  radioButtonGroup: (props: UiRadioButtonGroupProps) => VNode
  multiSelect: (props: UiMultiSelectProps) => VNode
  multiItemSelect: (props: UiMultiSelectProps) => VNode
  multiValueSelect: (props: UiMultiSelectProps) => VNode
  multiTextSelect: (props: UiMultiSelectProps) => VNode
  multiBitSelect: (props: UiMultiSelectProps) => VNode
  treeSelect: (props: UiTreeSelectProps) => VNode
  /** 与 `treeSelect` 同一实现（EJ2 DropDownTree 名）。 */
  dropDownTree: (props: UiTreeSelectProps) => VNode
  comboBox: (props: UiComboBoxProps) => VNode
  title: UiRenderer<string>
  subtitle: UiRenderer<string>
  link: (props: UiLinkProps, slots?: UiLinkSlots) => VNode
  iconField: UiRenderer<string>
  autoComplete: (value: string, props?: UiAutoCompleteProps) => VNode
  tagAutoComplete: (value: string, props?: UiTagAutoCompleteProps) => VNode
  button: UiButtonRenderer
  buttonGroup: (
    children: () => VNode[],
    props?: UiButtonGroupProps,
  ) => VNode
  splitButton: (props: UiSplitButtonProps, slots?: UiSlots) => VNode
  dropDownButton: (
    props: UiDropDownButtonProps,
    actions: UiAction[],
    slots?: UiSlots,
  ) => VNode
  /** 更多菜单；实现只调 dropDownButton，不是第三套厂商控件。 */
  moreMenuButton: (
    props: UiDropDownButtonProps,
    actions: UiAction[],
    slots?: UiSlots,
  ) => VNode
  floatingActionButton: (
    props: UiFloatingActionButtonProps,
    slots?: UiButtonSlots,
  ) => VNode
  selectButtonGroup: (
    value: unknown,
    props?: UiSelectButtonGroupProps,
  ) => VNode
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
  list: <T>(model: T[], metaUi: MetaUi, props?: UiListPropsType<T>) => VNode
  tree: <T>(props: UiTreePropsType<T>) => VNode
  table: <T>(model: T[], metaUi: MetaUi, props?: UiListPropsType<T>) => VNode
  grid: <T>(model: T[], metaUi: MetaUi, props?: UiListPropsType<T>) => VNode
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
  drawer: (props: UiSidebarProps, slots?: UiSidebarSlots) => VNode
  splitter: (panes: UiSplitterPane[], props?: UiSplitterProps) => VNode
  searchForRelative: (
    props: SearchForRelativeProps | PropData,
    slots?: UiSlots,
  ) => VNode
  formField: (props: PropData, slots?: UiSlots) => VNode
}

/** @deprecated 使用 UiFactory；chrome 方法已并入基接口。 */
export type PrimeVueUiFactory = UiFactory
export type SyncfusionUiFactory = UiFactory

export const durationOfSeconds: UiRenderer<number> = (seconds, props) =>
  h('span', props, () => friendlySeconds(seconds, props?.locale))
export const durationOfDays: UiRenderer<string[]> = (dates, props) =>
  h('span', props, () => daysBetween(dates[0], dates[1], props?.locale))
export const relativeTime: UiRenderer<string> = (sqlDateTime, props) =>
  h('span', props, () => formatRelativeTime(sqlDateTime, props?.locale))
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
