import type { MetaUi } from '../metaui/metaui_group'
import type { Pagination } from '../models/pagination'
import type { UiAction } from './action'
import type { UiAutoCompleteProps, UiTagAutoCompleteProps } from './autocomplete'
import type { UiBarcodeProps, UiQrCodeProps } from './code'
import type {
  UiFileLinkProps,
  UiFileUploaderProps,
  UiFilesUploaderProps,
  UiImageUploaderProps,
  UiImagesUploaderProps,
} from './file'
import type {
  UiInplaceEditorProps,
  UiInplaceEditorSlots,
} from './inplace_editor'
import type { UiQueryBuilderProps } from './query_builder'
import type { UiSignaturePadProps } from './signature_pad'
import type { UiSpeechToTextProps } from './speech_to_text'
import type { UiStepperProps } from './stepper'
import type { UiTimelineProps } from './timeline'
import type { UiTreeSelectProps } from './tree_select'
import type {
  UiButtonGroupProps,
  UiButtonProps,
  UiButtonSlots,
  UiDropDownButtonProps,
  UiFloatingActionButtonProps,
  UiLinkProps,
  UiLinkSlots,
  UiSelectButtonGroupProps,
  UiSplitButtonProps,
} from './button'
import type { UiCheckBoxProps, UiSwitchProps } from './check_box'
import type {
  UiAvatarProps,
  UiBadgeProps,
  UiBreadcrumbProps,
  UiCardProps,
  UiCardSlots,
  UiCarouselProps,
  UiContextMenuProps,
  UiDividerProps,
  UiImageGalleryItem,
  UiDrawerProps,
  UiLoadingProps,
  UiProgressBarProps,
  UiSidebarProps,
  UiSkeletonProps,
  UiSplitterPane,
  UiSplitterProps,
  UiTabsProps,
  UiToolbarProps,
  UiToolbarSlots,
  UiTooltipProps,
  UiTooltipSlots,
} from './chrome'
import type {
  UiCalendarProps,
  UiDatePickerProps,
  UiDateRangePickerProps,
  UiDateTimePickerProps,
  UiTimePickerProps,
} from './date_picker'
import type {
  UiChipsProps,
  UiColorPickerProps,
  UiMaskedTextBoxProps,
  UiOneTimePasswordInputProps,
  UiRatingProps,
  UiSliderProps,
} from './input_extra'
import type { UiListProps, UiPaginatorProps } from './list'
import type { UiTableProps } from './table'
import type { UiGridProps, UiTreeGridProps } from './grid'
import type { UiTreeProps } from './tree'
import type { UiLayout } from './layout'
import type { UiProps } from './props'
import type {
  UiCheckBoxListProps,
  UiComboBoxProps,
  UiDropDownListProps,
  UiMultiSelectProps,
  UiRadioButtonGroupProps,
} from './select'
import type {
  UiNumberInputProps,
  UiTextAreaProps,
  UiTextInputProps,
} from './text_input'

/**
 * Logic 拼控件用的工厂。皮肤在 vui-* 实现。
 * 复杂 view 走 UiBuilder.buildView；不要 factory.dialog / selector。
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
  switch?(value?: boolean | UiSwitchProps, props?: UiSwitchProps): TNode
  dropDownList?(props?: UiDropDownListProps): TNode
  comboBox?(props?: UiComboBoxProps): TNode
  multiSelect?(props?: UiMultiSelectProps): TNode
  radioButtonGroup?(props?: UiRadioButtonGroupProps): TNode
  treeSelect?(props?: UiTreeSelectProps<any, TNode>): TNode
  dropDownTree?(props?: UiTreeSelectProps<any, TNode>): TNode
  autoComplete?(value: string, props?: UiAutoCompleteProps): TNode
  tagAutoComplete?(value: string, props?: UiTagAutoCompleteProps): TNode
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
