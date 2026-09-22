import type { UiProps } from './props'
import type { UiTimelineProps } from './plugins/timeline'
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
import type { UiTreeSelectProps } from './factory/tree_select'
import type {
  UiButtonGroupProps,
  UiButtonProps,
  UiButtonSlots,
  UiLinkProps,
  UiLinkSlots,
  UiSelectButtonGroupProps,
} from './factory/button'
import type {
  UiDropDownButtonProps,
  UiDropDownButtonSlots,
} from './factory/drop_down_button'
import type { UiFloatingActionButtonProps } from './factory/floating_action_button'
import type {
  UiSplitButtonProps,
  UiSplitButtonSlots,
} from './factory/split_button'
import type { UiCheckBoxProps } from './factory/checkbox'
import type { UiSwitchProps } from './factory/switch'
import type { UiAvatarProps } from './factory/avatar'
import type { UiBadgeProps } from './factory/badge'
import type { UiMessageProps } from './factory/message'
import type { UiBreadcrumbProps } from './factory/breadcrumb'
import type { UiCardProps, UiCardSlots } from './factory/card'
import type { UiCarouselProps, UiImageGalleryProps } from './factory/carousel'
import type { UiContextMenuProps } from './factory/context_menu'
import type { UiDividerProps } from './factory/divider'
import type { UiErrorProps } from './factory/error'
import type { UiSearchRefProps } from './factory/search_relative'
import type { UiLoadingProps } from './factory/loading'
import type { UiProgressBarProps } from './factory/progress_bar'
import type { UiDrawerProps, UiSidebarProps } from './factory/sidebar'
import type { UiSkeletonProps } from './factory/skeleton'
import type { UiSplitterProps, UiSplitterSlots } from './factory/splitter'
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
import type { UiListProps, UiPaginatorProps } from './factory/list'
import type { UiTableProps } from './factory/table'
import type { UiGridProps, UiTreeGridProps } from './factory/grid'
import type { UiTreeProps } from './factory/tree'
import type { UiCheckBoxListProps } from './factory/check_box_list'
import type { UiComboBoxProps } from './factory/combo_box'
import type { UiDropDownListProps } from './factory/drop_down_list'
import type { UiMultiSelectProps } from './factory/multi_select'
import type { UiRadioButtonGroupProps } from './factory/radio_button_group'
import type { UiNumberInputProps } from './factory/number_input'
import type { UiTextAreaProps } from './factory/text_area'
import type { UiTextInputProps } from './factory/text_input'
import type { UiTextProps } from './factory/text'
import type { UiIconProps } from './factory/icon'
import type { UiImageProps } from './factory/image'


/**
 * 原子 chrome 控件工厂。皮肤在 vui-* 实现。
 *
 * 一个方法 ≈ 一个控件。复杂拼屏走 {@link import('./builder').UiBuilder}；
 * 字段行走 {@link import('./field_factory').UiFieldFactory}。
 * 不要 `factory.dialog` / selector（弹层走 Builder Overlay）。
 * 参数用具名 Ui*Props（本包），不要 Record 糊弄。
 */
/**
 * 表单字段壳（标签 + 控件）的具名入参：皮肤实现读的键在下面显式列出。
 */
export interface UiFormFieldProps extends UiProps {
  /** 字段标签（调用方已翻译）。Syncfusion Vue 皮肤据此画 `<label>`。 */
  label?: string
}

export interface UiFactory<TNode = any> {
  /** 表格组件是否原生支持单元格编辑。 */
  nativeInplaceEdit?: boolean

  textSpan(props: UiTextProps): TNode
  label(props: UiTextProps): TNode
  title(props: UiTextProps): TNode
  subtitle(props: UiTextProps): TNode
  icon(props: UiIconProps): TNode
  image(props: UiImageProps): TNode

  button(
    props: UiButtonProps,
    slots?: UiButtonSlots<TNode>,
  ): TNode
  buttonGroup(
    props?: UiButtonGroupProps,
    slots?: UiButtonSlots<TNode>,
  ): TNode
  selectButtonGroup(props: UiSelectButtonGroupProps): TNode
  link(props: UiLinkProps, slots?: UiLinkSlots<TNode>): TNode
  splitButton(
    props: UiSplitButtonProps,
    slots?: UiSplitButtonSlots<TNode>,
  ): TNode
  dropDownButton(
    props: UiDropDownButtonProps,
    slots?: UiDropDownButtonSlots<TNode>,
  ): TNode
  moreMenuButton(
    props: UiDropDownButtonProps,
    slots?: UiDropDownButtonSlots<TNode>,
  ): TNode
  floatingActionButton(
    props: UiFloatingActionButtonProps,
    slots?: UiButtonSlots<TNode>,
  ): TNode

  formField(
    props: UiFormFieldProps,
    slots?: { default?: () => TNode },
  ): TNode

  list<T>(props: UiListProps<T>): TNode
  table<T>(props: UiTableProps<T, TNode>): TNode
  grid<T>(props: UiGridProps<T, TNode>): TNode
  treeGrid<T>(props: UiTreeGridProps<T, TNode>): TNode
  /** chrome 导航树。不是 treeSelect / treeGrid。 */
  tree<T>(props: UiTreeProps<T, TNode>): TNode

  paginator(props: UiPaginatorProps): TNode

  textInput(props: UiTextInputProps): TNode
  textArea(props: UiTextAreaProps): TNode
  numberInput(props: UiNumberInputProps): TNode
  datePicker(props: UiDatePickerProps): TNode
  /** 月份模式：调 DatePicker（视图与选项值不同）。 */
  monthPicker(props: UiDatePickerProps): TNode
  dateTimePicker(props: UiDateTimePickerProps): TNode
  timePicker(props: UiTimePickerProps): TNode
  dateRangePicker(props: UiDateRangePickerProps): TNode
  checkBox(props: UiCheckBoxProps): TNode
  switch(props: UiSwitchProps): TNode
  dropDownList(props: UiDropDownListProps): TNode
  comboBox(props: UiComboBoxProps): TNode
  multiSelect(props: UiMultiSelectProps): TNode
  /** 多选：显示实体项（labelFn 取对象）。 */ 
  multiItemSelect(props: UiMultiSelectProps): TNode
  /** 多选：显示值本身。 */
  multiValueSelect(props: UiMultiSelectProps): TNode
  /** 多选：显示文本。 */
  multiTextSelect(props: UiMultiSelectProps): TNode
  /** 多选：位标志勾选。 */
  multiBitSelect(props: UiMultiSelectProps): TNode
  radioButtonGroup(props: UiRadioButtonGroupProps): TNode
  treeSelect(props: UiTreeSelectProps<unknown, TNode>): TNode
  /** {@link treeSelect} 的别名（服务端老配置沿用这个名字）。 */
  dropDownTree(props: UiTreeSelectProps<unknown, TNode>): TNode
  autoComplete(props: UiAutoCompleteProps): TNode
  tagAutoComplete(props: UiTagAutoCompleteProps): TNode
  checkBoxList(props: UiCheckBoxListProps): TNode
  bitCheckBoxList(props: UiCheckBoxListProps): TNode
  calendar(props: UiCalendarProps<TNode>): TNode
  carousel(props: UiCarouselProps<TNode>): TNode
  contextMenu(props: UiContextMenuProps): TNode
  inplaceEditor(
    props: UiInplaceEditorProps,
    slots?: UiInplaceEditorSlots<TNode>,
  ): TNode
  queryBuilder(props: UiQueryBuilderProps): TNode
  signaturePad(props: UiSignaturePadProps): TNode
  stepper(props: UiStepperProps): TNode
  speechToText(props: UiSpeechToTextProps): TNode
  barcode(props: UiBarcodeProps): TNode
  qrCode(props: UiQrCodeProps): TNode
  fileLink(props: UiFileLinkProps): TNode
  fileUploader(props: UiFileUploaderProps): TNode
  filesUploader(props: UiFilesUploaderProps): TNode
  imageUploader(props: UiImageUploaderProps): TNode
  imagesUploader(props: UiImagesUploaderProps): TNode
  imageGallery?(props: UiImageGalleryProps): TNode
  colorPicker(props: UiColorPickerProps): TNode
  maskedTextBox(props: UiMaskedTextBoxProps): TNode
  oneTimePasswordInput(props: UiOneTimePasswordInputProps): TNode
  slider(props: UiSliderProps): TNode
  rating(props: UiRatingProps<TNode>): TNode
  chips(props: UiChipsProps): TNode
  progressBar(props: UiProgressBarProps): TNode

  badge(props: UiBadgeProps): TNode
  /** 页内消息条（详情/编辑顶栏）；不要用 toast 画这条。 */
  message(props: UiMessageProps): TNode
  avatar(props: UiAvatarProps): TNode
  breadcrumb(props: UiBreadcrumbProps): TNode
  card(props: UiCardProps, slots?: UiCardSlots<TNode>): TNode
  divider(props: UiDividerProps): TNode
  tooltip(
    props: UiTooltipProps,
    slots?: UiTooltipSlots<TNode>,
  ): TNode
  tabs(props: UiTabsProps<TNode>): TNode
  toolbar(
    props: UiToolbarProps,
    slots?: UiToolbarSlots<TNode>,
  ): TNode
  splitter(props?: UiSplitterProps, slots?: UiSplitterSlots<TNode>): TNode
  sidebar(
    props: UiSidebarProps,
    slots?: { default?: () => TNode },
  ): TNode
  drawer(
    props: UiDrawerProps,
    slots?: { default?: () => TNode },
  ): TNode
  loading(props?: UiLoadingProps): TNode
  /** 页级异常重试面板（打开失败 / 列表重载失败）；不要用 message 顶栏顶替。 */
  error(props: UiErrorProps): TNode
  skeleton(props: UiSkeletonProps): TNode

  /** 时间轴。chrome 默认 `factory.timeline`，可选引擎用 `builder.use(...)` 插件覆盖。 */
  timeline?(props: UiTimelineProps): TNode

  searchRelative(props: UiSearchRefProps): TNode
}
