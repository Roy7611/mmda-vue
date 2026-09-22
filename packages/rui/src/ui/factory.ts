/**
 * ReactUiFactory — React 控件工厂抽象基类，对标 VueUiFactory。
 *
 * 继承 core 的 {@link AbstractUiFactory}（提供 `textSpan / label / title /
 * subtitle / icon` 5 个纯 HTML 壳方法），本类补齐：
 * - React 通用默认实现：`image` / `iconField` / `multi*Select`
 * - core {@link UiFactory} 的全部控件存根（返回 null，皮肤逐个覆盖）
 * - React 特有的抽象契约：图标表 / `actionButton` / `toast` / `confirm` / `dialog`
 *
 * 皮肤包（@mmda/rui-syncfusion）`extends ReactUiFactory`，只写厂商真实实现
 * 与图标表，不再直接继承 core。
 */
import { createElement, type ReactElement, type ReactNode } from 'react'
import {
  AbstractUiFactory,
  type UiRenderer,
  type UiNodeProps,
  type TranslateFn,
  type UiProps,
  type UiAutoCompleteProps,
  type UiTagAutoCompleteProps,
  type UiBarcodeProps,
  type UiQrCodeProps,
  type UiFileLinkProps,
  type UiFileUploaderProps,
  type UiFilesUploaderProps,
  type UiImageUploaderProps,
  type UiImagesUploaderProps,
  type UiInplaceEditorProps,
  type UiInplaceEditorSlots,
  type UiQueryBuilderProps,
  type UiSignaturePadProps,
  type UiSpeechToTextProps,
  type UiStepperProps,
  type UiTreeSelectProps,
  type UiButtonGroupProps,
  type UiButtonProps,
  type UiButtonSlots,
  type UiLinkProps,
  type UiLinkSlots,
  type UiSelectButtonGroupProps,
  type UiDropDownButtonProps,
  type UiDropDownButtonSlots,
  type UiFloatingActionButtonProps,
  type UiSplitButtonProps,
  type UiSplitButtonSlots,
  type UiCheckBoxProps,
  type UiSwitchProps,
  type UiAvatarProps,
  type UiBadgeProps,
  type UiMessageProps,
  type UiBreadcrumbProps,
  type UiCardProps,
  type UiCardSlots,
  type UiCarouselProps,
  type UiImageGalleryProps,
  type UiContextMenuProps,
  type UiDividerProps,
  type UiErrorProps,
  type UiSearchRefProps,
  type UiLoadingProps,
  type UiProgressBarProps,
  type UiDrawerProps,
  type UiSidebarProps,
  type UiSkeletonProps,
  type UiSplitterProps,
  type UiSplitterSlots,
  type UiTabsProps,
  type UiToolbarProps,
  type UiToolbarSlots,
  type UiTooltipProps,
  type UiTooltipSlots,
  type UiCalendarProps,
  type UiDatePickerProps,
  type UiDateRangePickerProps,
  type UiDateTimePickerProps,
  type UiTimePickerProps,
  type UiChipsProps,
  type UiColorPickerProps,
  type UiMaskedTextBoxProps,
  type UiOneTimePasswordInputProps,
  type UiRatingProps,
  type UiSliderProps,
  type UiListProps,
  type UiPaginatorProps,
  type UiTableProps,
  type UiGridProps,
  type UiTreeGridProps,
  type UiTreeProps,
  type UiCheckBoxListProps,
  type UiComboBoxProps,
  type UiDropDownListProps,
  type UiMultiSelectProps,
  type UiRadioButtonGroupProps,
  type UiNumberInputProps,
  type UiTextAreaProps,
  type UiTextInputProps,
  type UiIconProps,
  type UiImageProps,
  type UiToastProps,
  type UiDialogProps,
  type UiDialogAction,
} from '@mmda/core'

/** React 最底层渲染器：core {@link UiRenderer} 的 ReactNode 特化。 */
export interface RuiRenderer
  extends UiRenderer<ReactNode, UiNodeProps> {}

export abstract class ReactUiFactory
  extends AbstractUiFactory<ReactNode>
{
  // —— React 特有抽象契约：每个皮肤必须实现 ——
  abstract actionIcons: Record<string, string>
  abstract viewIcons: Record<string, string>
  abstract dialogIcons: Record<string, string>
  abstract resolveIcon(icon: string): ReactElement | null
  abstract actionButton(
    action: any,
    t: TranslateFn,
    resolve?: boolean,
    props?: UiButtonProps,
  ): ReactElement
  abstract toast(props: UiToastProps): void
  abstract confirm(message: string): Promise<boolean>
  abstract dialog(
    props: UiDialogProps,
    content?: ReactNode,
  ): Promise<UiDialogAction>

  // —— React 通用默认实现（皮肤可覆盖） ——
  nativeInplaceEdit = false

  image(props: UiImageProps): ReactNode {
    return this.el('img', {
      src: props.src,
      className: props.class,
      style: props.style,
    })
  }

  iconField(props: UiIconProps): ReactElement {
    return this.icon(props) as ReactElement
  }

  multiItemSelect(props: UiMultiSelectProps): ReactNode {
    return this.stub(props)
  }

  multiValueSelect(props: UiMultiSelectProps): ReactNode {
    return this.stub(props)
  }

  multiTextSelect(props: UiMultiSelectProps): ReactNode {
    return this.stub(props)
  }

  multiBitSelect(props: UiMultiSelectProps): ReactNode {
    return this.stub(props)
  }

  // —— core UiFactory 控件存根：皮肤逐个覆盖 ——
  button(props: UiButtonProps, slots?: UiButtonSlots<ReactNode>): ReactNode {
    return this.stub(props)
  }
  buttonGroup(
    props?: UiButtonGroupProps,
    slots?: UiButtonSlots<ReactNode>,
  ): ReactNode {
    return this.stub(props)
  }
  selectButtonGroup(props: UiSelectButtonGroupProps): ReactNode {
    return this.stub(props)
  }
  link(props: UiLinkProps, slots?: UiLinkSlots<ReactNode>): ReactNode {
    return this.stub(props)
  }
  splitButton(
    props: UiSplitButtonProps,
    slots?: UiSplitButtonSlots<ReactNode>,
  ): ReactNode {
    return this.stub(props)
  }
  dropDownButton(
    props: UiDropDownButtonProps,
    slots?: UiDropDownButtonSlots<ReactNode>,
  ): ReactNode {
    return this.stub(props)
  }
  moreMenuButton(
    props: UiDropDownButtonProps,
    slots?: UiDropDownButtonSlots<ReactNode>,
  ): ReactNode {
    return this.stub(props)
  }
  floatingActionButton(
    props: UiFloatingActionButtonProps,
    slots?: UiButtonSlots<ReactNode>,
  ): ReactNode {
    return this.stub(props)
  }
  formField(
    props: UiProps,
    slots?: { default?: () => ReactNode },
  ): ReactNode {
    return this.stub(props)
  }

  list<T>(props: UiListProps<T>): ReactNode {
    return this.stub(props)
  }
  table<T>(props: UiTableProps<T, ReactNode>): ReactNode {
    return this.stub(props)
  }
  grid<T>(props: UiGridProps<T, ReactNode>): ReactNode {
    return this.stub(props)
  }
  treeGrid<T>(props: UiTreeGridProps<T, ReactNode>): ReactNode {
    return this.stub(props)
  }
  tree<T>(props: UiTreeProps<T, ReactNode>): ReactNode {
    return this.stub(props)
  }
  paginator(props: UiPaginatorProps): ReactNode {
    return this.stub(props)
  }

  textInput(props: UiTextInputProps): ReactNode {
    return this.stub(props)
  }
  textArea(props: UiTextAreaProps): ReactNode {
    return this.stub(props)
  }
  numberInput(props: UiNumberInputProps): ReactNode {
    return this.stub(props)
  }
  datePicker(props: UiDatePickerProps): ReactNode {
    return this.stub(props)
  }
  monthPicker(props: UiDatePickerProps): ReactNode {
    return this.stub(props)
  }
  dateTimePicker(props: UiDateTimePickerProps): ReactNode {
    return this.stub(props)
  }
  timePicker(props: UiTimePickerProps): ReactNode {
    return this.stub(props)
  }
  dateRangePicker(props: UiDateRangePickerProps): ReactNode {
    return this.stub(props)
  }
  checkBox(props: UiCheckBoxProps): ReactNode {
    return this.stub(props)
  }
  switch(props: UiSwitchProps): ReactNode {
    return this.stub(props)
  }
  dropDownList(props: UiDropDownListProps): ReactNode {
    return this.stub(props)
  }
  comboBox(props: UiComboBoxProps): ReactNode {
    return this.stub(props)
  }
  multiSelect(props: UiMultiSelectProps): ReactNode {
    return this.stub(props)
  }
  radioButtonGroup(props: UiRadioButtonGroupProps): ReactNode {
    return this.stub(props)
  }
  treeSelect(props: UiTreeSelectProps<any, ReactNode>): ReactNode {
    return this.stub(props)
  }
  dropDownTree(props: UiTreeSelectProps<any, ReactNode>): ReactNode {
    return this.stub(props)
  }
  autoComplete(props: UiAutoCompleteProps): ReactNode {
    return this.stub(props)
  }
  tagAutoComplete(props: UiTagAutoCompleteProps): ReactNode {
    return this.stub(props)
  }
  checkBoxList(props: UiCheckBoxListProps): ReactNode {
    return this.stub(props)
  }
  bitCheckBoxList(props: UiCheckBoxListProps): ReactNode {
    return this.stub(props)
  }
  calendar(props: UiCalendarProps<ReactNode>): ReactNode {
    return this.stub(props)
  }
  carousel(props: UiCarouselProps<ReactNode>): ReactNode {
    return this.stub(props)
  }
  contextMenu(props: UiContextMenuProps): ReactNode {
    return this.stub(props)
  }
  inplaceEditor(
    props: UiInplaceEditorProps,
    slots?: UiInplaceEditorSlots<ReactNode>,
  ): ReactNode {
    return this.stub(props)
  }
  queryBuilder(props: UiQueryBuilderProps): ReactNode {
    return this.stub(props)
  }
  signaturePad(props: UiSignaturePadProps): ReactNode {
    return this.stub(props)
  }
  stepper(props: UiStepperProps): ReactNode {
    return this.stub(props)
  }
  speechToText(props: UiSpeechToTextProps): ReactNode {
    return this.stub(props)
  }
  barcode(props: UiBarcodeProps): ReactNode {
    return this.stub(props)
  }
  qrCode(props: UiQrCodeProps): ReactNode {
    return this.stub(props)
  }
  fileLink(props: UiFileLinkProps): ReactNode {
    return this.stub(props)
  }
  fileUploader(props: UiFileUploaderProps): ReactNode {
    return this.stub(props)
  }
  filesUploader(props: UiFilesUploaderProps): ReactNode {
    return this.stub(props)
  }
  imageUploader(props: UiImageUploaderProps): ReactNode {
    return this.stub(props)
  }
  imagesUploader(props: UiImagesUploaderProps): ReactNode {
    return this.stub(props)
  }
  imageGallery(props: UiImageGalleryProps): ReactNode {
    return this.stub(props)
  }
  colorPicker(props: UiColorPickerProps): ReactNode {
    return this.stub(props)
  }
  maskedTextBox(props: UiMaskedTextBoxProps): ReactNode {
    return this.stub(props)
  }
  oneTimePasswordInput(props: UiOneTimePasswordInputProps): ReactNode {
    return this.stub(props)
  }
  slider(props: UiSliderProps): ReactNode {
    return this.stub(props)
  }
  rating(props: UiRatingProps<ReactNode>): ReactNode {
    return this.stub(props)
  }
  chips(props: UiChipsProps): ReactNode {
    return this.stub(props)
  }
  progressBar(props: UiProgressBarProps): ReactNode {
    return this.stub(props)
  }
  badge(props: UiBadgeProps): ReactNode {
    return this.stub(props)
  }
  message(props: UiMessageProps): ReactNode {
    return this.stub(props)
  }
  avatar(props: UiAvatarProps): ReactNode {
    return this.stub(props)
  }
  breadcrumb(props: UiBreadcrumbProps): ReactNode {
    return this.stub(props)
  }
  card(props: UiCardProps, slots?: UiCardSlots<ReactNode>): ReactNode {
    return this.stub(props)
  }
  divider(props: UiDividerProps): ReactNode {
    return this.stub(props)
  }
  tooltip(
    props: UiTooltipProps,
    slots?: UiTooltipSlots<ReactNode>,
  ): ReactNode {
    return this.stub(props)
  }
  tabs(props: UiTabsProps<ReactNode>): ReactNode {
    return this.stub(props)
  }
  toolbar(
    props: UiToolbarProps,
    slots?: UiToolbarSlots<ReactNode>,
  ): ReactNode {
    return this.stub(props)
  }
  splitter(
    props?: UiSplitterProps,
    slots?: UiSplitterSlots<ReactNode>,
  ): ReactNode {
    return this.stub(props)
  }
  sidebar(
    props: UiSidebarProps,
    slots?: { default?: () => ReactNode },
  ): ReactNode {
    return this.stub(props)
  }
  drawer(
    props: UiDrawerProps,
    slots?: { default?: () => ReactNode },
  ): ReactNode {
    return this.stub(props)
  }
  loading(props?: UiLoadingProps): ReactNode {
    return this.stub(props)
  }
  error(props: UiErrorProps): ReactNode {
    return this.stub(props)
  }
  skeleton(props: UiSkeletonProps): ReactNode {
    return this.stub(props)
  }
  searchRelative(props: UiSearchRefProps): ReactNode {
    return this.stub(props)
  }

  // —— 渲染辅助 ——
  protected el(
    tag: string,
    props: Record<string, unknown> = {},
    ...children: ReactNode[]
  ): ReactElement {
    return createElement(tag, props, ...children)
  }

  protected stub(_props?: unknown): ReactElement | null {
    return null
  }
}
