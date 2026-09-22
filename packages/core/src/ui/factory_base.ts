import type { UiFactory } from './factory'
import type { UiProps } from './props'
import type { UiNodeProps } from './layout'
import type { UiRenderer } from './renderer'
import type { UiAutoCompleteProps } from './factory/autocomplete'
import type { UiTagAutoCompleteProps } from './factory/tag_auto_complete'
import type { UiBarcodeProps } from './factory/barcode'
import type { UiQrCodeProps } from './factory/qrcode'
import type { UiFileLinkProps } from './factory/file_link'
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
 * 皮肤工厂抽象基类：实现 core {@link UiFactory} 全量契约。
 *
 * 只拼 `span` / `label` / `h3` / `small` / `i` 5 个纯 HTML 壳，其余平台控件
 * 声明为抽象方法，由皮肤类（vui-* / rui-*）逐个补齐。
 *
 * @typeParam TNode 框架节点。vui 为 Vue `VNode`，rui 为 React `ReactNode`。
 */
export abstract class AbstractUiFactory<TNode = unknown>
  implements UiFactory<TNode>
{
  constructor(protected readonly renderer: UiRenderer<TNode, UiNodeProps>) {}

  textSpan(props: UiTextProps): TNode {
    return this.renderText('span', props)
  }

  label(props: UiTextProps): TNode {
    return this.renderText('label', props)
  }

  title(props: UiTextProps): TNode {
    return this.renderText('h3', props)
  }

  subtitle(props: UiTextProps): TNode {
    return this.renderText('small', props)
  }

  icon(props: UiIconProps): TNode {
    const { iconClass, ...attributes } = props
    return this.renderer.render('i', { class: iconClass, attributes }, [])
  }

  // —— 平台控件：皮肤实现 ——
  abstract image(props: UiImageProps): TNode

  abstract button(props: UiButtonProps, slots?: UiButtonSlots<TNode>): TNode
  abstract buttonGroup(
    props?: UiButtonGroupProps,
    slots?: UiButtonSlots<TNode>,
  ): TNode
  abstract selectButtonGroup(props: UiSelectButtonGroupProps): TNode
  abstract link(props: UiLinkProps, slots?: UiLinkSlots<TNode>): TNode
  abstract splitButton(
    props: UiSplitButtonProps,
    slots?: UiSplitButtonSlots<TNode>,
  ): TNode
  abstract dropDownButton(
    props: UiDropDownButtonProps,
    slots?: UiDropDownButtonSlots<TNode>,
  ): TNode
  abstract moreMenuButton(
    props: UiDropDownButtonProps,
    slots?: UiDropDownButtonSlots<TNode>,
  ): TNode
  abstract floatingActionButton(
    props: UiFloatingActionButtonProps,
    slots?: UiButtonSlots<TNode>,
  ): TNode
  abstract formField(
    props: UiProps,
    slots?: { default?: () => TNode },
  ): TNode

  abstract list<T>(props: UiListProps<T>): TNode
  abstract table<T>(props: UiTableProps<T, TNode>): TNode
  abstract grid<T>(props: UiGridProps<T, TNode>): TNode
  abstract treeGrid<T>(props: UiTreeGridProps<T, TNode>): TNode
  abstract tree<T>(props: UiTreeProps<T, TNode>): TNode
  abstract paginator(props: UiPaginatorProps): TNode

  abstract textInput(props: UiTextInputProps): TNode
  abstract textArea(props: UiTextAreaProps): TNode
  abstract numberInput(props: UiNumberInputProps): TNode
  abstract datePicker(props: UiDatePickerProps): TNode
  abstract monthPicker(props: UiDatePickerProps): TNode
  abstract dateTimePicker(props: UiDateTimePickerProps): TNode
  abstract timePicker(props: UiTimePickerProps): TNode
  abstract dateRangePicker(props: UiDateRangePickerProps): TNode
  abstract checkBox(props: UiCheckBoxProps): TNode
  abstract switch(props: UiSwitchProps): TNode
  abstract dropDownList(props: UiDropDownListProps): TNode
  abstract comboBox(props: UiComboBoxProps): TNode
  abstract multiSelect(props: UiMultiSelectProps): TNode
  abstract multiItemSelect(props: UiMultiSelectProps): TNode
  abstract multiValueSelect(props: UiMultiSelectProps): TNode
  abstract multiTextSelect(props: UiMultiSelectProps): TNode
  abstract multiBitSelect(props: UiMultiSelectProps): TNode
  abstract radioButtonGroup(props: UiRadioButtonGroupProps): TNode
  abstract treeSelect(props: UiTreeSelectProps<unknown, TNode>): TNode
  abstract dropDownTree(props: UiTreeSelectProps<unknown, TNode>): TNode
  abstract autoComplete(props: UiAutoCompleteProps): TNode
  abstract tagAutoComplete(props: UiTagAutoCompleteProps): TNode
  abstract checkBoxList(props: UiCheckBoxListProps): TNode
  abstract bitCheckBoxList(props: UiCheckBoxListProps): TNode
  abstract calendar(props: UiCalendarProps<TNode>): TNode
  abstract carousel(props: UiCarouselProps<TNode>): TNode
  abstract contextMenu(props: UiContextMenuProps): TNode
  abstract inplaceEditor(
    props: UiInplaceEditorProps,
    slots?: UiInplaceEditorSlots<TNode>,
  ): TNode
  abstract queryBuilder(props: UiQueryBuilderProps): TNode
  abstract signaturePad(props: UiSignaturePadProps): TNode
  abstract stepper(props: UiStepperProps): TNode
  abstract speechToText(props: UiSpeechToTextProps): TNode
  abstract barcode(props: UiBarcodeProps): TNode
  abstract qrCode(props: UiQrCodeProps): TNode
  abstract fileLink(props: UiFileLinkProps): TNode
  abstract fileUploader(props: UiFileUploaderProps): TNode
  abstract filesUploader(props: UiFilesUploaderProps): TNode
  abstract imageUploader(props: UiImageUploaderProps): TNode
  abstract imagesUploader(props: UiImagesUploaderProps): TNode
  abstract imageGallery(props: UiImageGalleryProps): TNode
  abstract colorPicker(props: UiColorPickerProps): TNode
  abstract maskedTextBox(props: UiMaskedTextBoxProps): TNode
  abstract oneTimePasswordInput(props: UiOneTimePasswordInputProps): TNode
  abstract slider(props: UiSliderProps): TNode
  abstract rating(props: UiRatingProps<TNode>): TNode
  abstract chips(props: UiChipsProps): TNode
  abstract progressBar(props: UiProgressBarProps): TNode

  abstract badge(props: UiBadgeProps): TNode
  abstract message(props: UiMessageProps): TNode
  abstract avatar(props: UiAvatarProps): TNode
  abstract breadcrumb(props: UiBreadcrumbProps): TNode
  abstract card(props: UiCardProps, slots?: UiCardSlots<TNode>): TNode
  abstract divider(props: UiDividerProps): TNode
  abstract tooltip(
    props: UiTooltipProps,
    slots?: UiTooltipSlots<TNode>,
  ): TNode
  abstract tabs(props: UiTabsProps<TNode>): TNode
  abstract toolbar(
    props: UiToolbarProps,
    slots?: UiToolbarSlots<TNode>,
  ): TNode
  abstract splitter(
    props?: UiSplitterProps,
    slots?: UiSplitterSlots<TNode>,
  ): TNode
  abstract sidebar(
    props: UiSidebarProps,
    slots?: { default?: () => TNode },
  ): TNode
  abstract drawer(
    props: UiDrawerProps,
    slots?: { default?: () => TNode },
  ): TNode
  abstract loading(props?: UiLoadingProps): TNode
  abstract error(props: UiErrorProps): TNode
  abstract skeleton(props: UiSkeletonProps): TNode
  abstract searchRelative(props: UiSearchRefProps): TNode

  /** 文本壳：`text` 作文本子节点，其余键（class / style / htmlAttributes）进 attributes。 */
  protected renderText(tag: string, props: UiTextProps): TNode {
    const { text, ...attributes } = props
    return this.renderer.render(tag, { attributes }, [String(text ?? '')])
  }
}
