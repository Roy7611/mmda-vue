import type { MetaUi } from '../metaui/metaui_group'
import type { Pagination } from '../models/pagination'
import type { UiAction } from './action'
import type { UiLayout } from './layout'
import type { UiProps } from './props'
import type { UiAutoCompleteProps } from './factory/autocomplete'
import type { UiTagAutoCompleteProps } from './factory/tag_auto_complete'
import type { UiBarcodeProps } from './factory/barcode'
import type { UiQrCodeProps } from './factory/qrcode'
import type {
  UiFileLinkProps,
} from './factory/file_link'
import type {
  UiFileUploaderProps,
  UiFilesUploaderProps,
} from './factory/file_uploader'
import type {
  UiImageUploaderProps,
  UiImagesUploaderProps,
} from './factory/image_uploader'
import type {
  UiInplaceEditorProps,
  UiInplaceEditorSlots,
} from './factory/inplace_editor'
import type { UiQueryBuilderProps } from './factory/query_builder'
import type { UiSignaturePadProps } from './factory/signature_pad'
import type { UiSpeechToTextProps } from './factory/speech_to_text'
import type { UiStepperProps } from './factory/stepper'
import type { UiTimelineProps } from './factory/timeline'
import type { UiTreeSelectProps } from './factory/tree_select'
import type {
  UiButtonGroupProps,
  UiButtonProps,
  UiButtonSlots,
  UiLinkProps,
  UiLinkSlots,
  UiSelectButtonGroupProps,
} from './factory/button'
import type { UiDropDownButtonProps } from './factory/drop_down_button'
import type { UiFloatingActionButtonProps } from './factory/floating_action_button'
import type { UiSplitButtonProps } from './factory/split_button'
import type { UiCheckBoxProps } from './factory/checkbox'
import type { UiSwitchProps } from './factory/switch'
import type { UiAvatarProps } from './factory/avatar'
import type { UiBadgeProps } from './factory/badge'
import type { UiMessageProps } from './factory/message'
import type { UiBreadcrumbProps } from './factory/breadcrumb'
import type { UiCardProps, UiCardSlots } from './factory/card'
import type { UiCarouselProps, UiImageGalleryItem } from './factory/carousel'
import type { UiContextMenuProps } from './factory/context_menu'
import type { UiDividerProps } from './factory/divider'
import type { UiLoadingProps } from './factory/loading'
import type { UiProgressBarProps } from './factory/progress_bar'
import type { UiDrawerProps, UiSidebarProps } from './factory/sidebar'
import type { UiSkeletonProps } from './factory/skeleton'
import type { UiSplitterPane, UiSplitterProps } from './factory/splitter'
import type { UiTabsProps } from './factory/tabs'
import type { UiToolbarProps, UiToolbarSlots } from './factory/toolbar'
import type { UiTooltipProps, UiTooltipSlots } from './factory/tooltip'
import type { UiCalendarProps } from './factory/calendar'
import type { UiDatePickerProps } from './factory/date_picker'
import type { UiDateRangePickerProps } from './factory/date_range_picker'
import type { UiDateTimePickerProps } from './factory/date_time_picker'
import type { UiTimePickerProps } from './factory/time_picker'
import type { UiChipsProps } from './factory/chips'
import type { UiColorPickerProps } from './factory/color_picker'
import type { UiMaskedTextBoxProps } from './factory/masked_text_box'
import type { UiOneTimePasswordInputProps } from './factory/one_time_password_input'
import type { UiRatingProps } from './factory/rating'
import type { UiSliderProps } from './factory/slider'
import type { UiListProps, UiPaginatorProps } from './builder/list'
import type { UiTableProps } from './builder/table'
import type { UiGridProps, UiTreeGridProps } from './builder/grid'
import type { UiTreeProps } from './factory/tree'
import type { UiCheckBoxListProps } from './factory/check_box_list'
import type { UiComboBoxProps } from './factory/combo_box'
import type { UiDropDownListProps } from './factory/drop_down_list'
import type { UiMultiSelectProps } from './factory/multi_select'
import type { UiRadioButtonGroupProps } from './factory/radio_button_group'
import type { UiNumberInputProps } from './factory/number_input'
import type { UiTextAreaProps } from './factory/text_area'
import type { UiTextInputProps } from './factory/text_input'

/**
 * 原子 chrome 控件工厂。皮肤在 vui-* 实现。
 *
 * 一个方法 ≈ 一个控件。复杂拼屏走 {@link import('./builder').UiBuilder}；
 * 字段行走 {@link import('./field_factory').UiFieldFactory}。
 * 不要 `factory.dialog` / selector（弹层走 Builder Overlay）。
 * 参数用具名 Ui*Props（本包），不要 Record 糊弄。
 */
export interface UiFactory<TNode = any> {
  layout?: UiLayout<TNode>
  /** 表格组件是否原生支持单元格编辑。 */
  nativeInplaceEdit?: boolean

  textSpan(text: string, props?: UiProps): TNode
  label?(text: string, props?: UiProps): TNode
  title?(text: string, props?: UiProps): TNode
  subtitle?(text: string, props?: UiProps): TNode
  icon?(iconClass: string, props?: UiProps): TNode
  image?(src: string, props?: UiProps): TNode

  button(
    props?: UiButtonProps,
    slots?: UiButtonSlots<TNode>,
  ): TNode
  buttonGroup(
    children: () => TNode[],
    props?: UiButtonGroupProps,
  ): TNode
  selectButtonGroup?(
    value: unknown,
    props?: UiSelectButtonGroupProps,
  ): TNode
  link?(props: UiLinkProps, slots?: UiLinkSlots<TNode>): TNode
  splitButton?(
    props: UiSplitButtonProps,
    slots?: Record<string, unknown>,
  ): TNode
  dropDownButton?(
    props: UiDropDownButtonProps,
    actions: UiAction[],
    slots?: Record<string, unknown>,
  ): TNode
  moreMenuButton?(
    props: UiDropDownButtonProps,
    actions: UiAction[],
    slots?: Record<string, unknown>,
  ): TNode
  floatingActionButton?(
    props: UiFloatingActionButtonProps,
    slots?: UiButtonSlots<TNode>,
  ): TNode

  formField?(
    props: UiProps,
    slots?: { default?: () => TNode },
  ): TNode

  list?<T>(
    rows: T[],
    metaUi: MetaUi,
    props?: UiListProps<T>,
  ): TNode
  table<T>(
    rows: T[],
    metaUi: MetaUi,
    props?: UiTableProps<T, TNode>,
  ): TNode
  grid?<T>(
    rows: T[],
    metaUi: MetaUi,
    props?: UiGridProps<T, TNode>,
  ): TNode
  treeGrid?<T>(
    rows: T[],
    metaUi: MetaUi,
    props?: UiTreeGridProps<T, TNode>,
  ): TNode
  /** chrome 导航树。不是 treeSelect / treeGrid。 */
  tree?<T>(props: UiTreeProps<T, TNode>): TNode

  paginator?(
    pagination: Pagination,
    props?: UiPaginatorProps,
  ): TNode

  textInput?(props?: UiTextInputProps): TNode
  textArea?(props?: UiTextAreaProps): TNode
  numberInput?(props?: UiNumberInputProps): TNode
  datePicker?(props?: UiDatePickerProps): TNode
  monthPicker?(props?: UiDatePickerProps): TNode
  dateTimePicker?(props?: UiDateTimePickerProps): TNode
  timePicker?(props?: UiTimePickerProps): TNode
  dateRangePicker?(props?: UiDateRangePickerProps): TNode
  checkBox?(props?: UiCheckBoxProps): TNode
  switch?(props?: UiSwitchProps): TNode
  dropDownList?(props?: UiDropDownListProps): TNode
  comboBox?(props?: UiComboBoxProps): TNode
  multiSelect?(props?: UiMultiSelectProps): TNode
  radioButtonGroup?(props?: UiRadioButtonGroupProps): TNode
  treeSelect?(props?: UiTreeSelectProps<any, TNode>): TNode
  dropDownTree?(props?: UiTreeSelectProps<any, TNode>): TNode
  autoComplete?(props?: UiAutoCompleteProps): TNode
  tagAutoComplete?(props?: UiTagAutoCompleteProps): TNode
  checkBoxList?(props?: UiCheckBoxListProps): TNode
  bitCheckBoxList?(props?: UiCheckBoxListProps): TNode
  calendar?(props?: UiCalendarProps<TNode>): TNode
  carousel?(props?: UiCarouselProps<TNode>): TNode
  contextMenu?(props?: UiContextMenuProps): TNode
  inplaceEditor?(
    props?: UiInplaceEditorProps,
    slots?: UiInplaceEditorSlots<TNode>,
  ): TNode
  queryBuilder?(props?: UiQueryBuilderProps): TNode
  signaturePad?(props?: UiSignaturePadProps): TNode
  stepper?(props?: UiStepperProps): TNode
  timeline?(props?: UiTimelineProps): TNode
  speechToText?(props?: UiSpeechToTextProps): TNode
  barcode?(props?: UiBarcodeProps): TNode
  qrCode?(props?: UiQrCodeProps): TNode
  fileLink?(props?: UiFileLinkProps): TNode
  fileUploader?(props?: UiFileUploaderProps): TNode
  filesUploader?(props?: UiFilesUploaderProps): TNode
  imageUploader?(props?: UiImageUploaderProps): TNode
  imagesUploader?(props?: UiImagesUploaderProps): TNode
  imageGallery?(items: UiImageGalleryItem[], props?: UiProps): TNode
  colorPicker?(props?: UiColorPickerProps): TNode
  maskedTextBox?(props?: UiMaskedTextBoxProps): TNode
  oneTimePasswordInput?(props?: UiOneTimePasswordInputProps): TNode
  slider?(props?: UiSliderProps): TNode
  rating?(props?: UiRatingProps<TNode>): TNode
  chips?(props?: UiChipsProps): TNode
  progressBar?(props?: UiProgressBarProps): TNode

  badge?(props?: UiBadgeProps): TNode
  /** 页内消息条（详情/编辑顶栏）；不要用 toast 画这条。 */
  message?(props?: UiMessageProps): TNode
  avatar?(props?: UiAvatarProps): TNode
  breadcrumb?(props?: UiBreadcrumbProps): TNode
  card?(props?: UiCardProps, slots?: UiCardSlots<TNode>): TNode
  divider?(props?: UiDividerProps): TNode
  tooltip?(
    props?: UiTooltipProps,
    slots?: UiTooltipSlots<TNode>,
  ): TNode
  tabs?(props?: UiTabsProps<TNode>): TNode
  toolbar?(
    props?: UiToolbarProps,
    slots?: UiToolbarSlots<TNode>,
  ): TNode
  splitter?(
    panes: UiSplitterPane<TNode>[],
    props?: UiSplitterProps,
  ): TNode
  sidebar?(
    props?: UiSidebarProps,
    slots?: { default?: () => TNode },
  ): TNode
  drawer?(
    props?: UiDrawerProps,
    slots?: { default?: () => TNode },
  ): TNode
  loading?(props?: UiLoadingProps): TNode
  skeleton?(props?: UiSkeletonProps): TNode

  searchForRelative?(props?: UiProps): TNode
}
