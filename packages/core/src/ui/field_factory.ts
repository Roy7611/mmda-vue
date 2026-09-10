import type { MetaUiField } from '../metaui/metaui_field'
import type { UiLayout } from './layout'

/**
 * 单个字段的渲染函数。
 * 返回裸控件节点；带标签行请走 {@link UiFieldFactory.render} / `editFor` / `displayFor`。
 */
export type UiFieldRenderer<TNode = any> = (
  field: MetaUiField,
  context: any,
  props?: Record<string, unknown>,
) => TNode

/** 字段读写；*PropsFromField 用。 */
export interface UiFieldBindContext {
  getFieldValue: (field: MetaUiField, row?: unknown) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
  t?: (key: string) => string
  model?: object
  searchRelative?: (
    field: MetaUiField,
    searchWord?: string,
  ) => Promise<unknown>
}

/**
 * 字段渲染器表。皮肤用编辑器/renderer 名做索引。
 *
 * 程序员入口：
 * - {@link render}：按会话自动选编辑或显示，并套默认字段布局（替代旧 `builder.buildField`）
 * - {@link editFor} / {@link displayFor}：强制编辑/只读的快捷方式
 * - 具名方法（`textInput` 等）：裸控件，表格单元格用这些，不要走 render（会带标签）
 *
 * 没有 `timeline`：时间轴不是单字段，走 `factory.timeline` / `buildTimelineView`。
 */
export interface UiFieldFactory<TNode = any>
  extends Record<string, UiFieldRenderer<TNode> | undefined> {
  /**
   * 排字段行用的布局。vui 构造时注入；`render` / `editFor` / `displayFor` 调 `layout.layoutField`。
   */
  layout?: UiLayout<TNode>

  /** 元数据未配 editor 时的默认输入控件。 */
  fallbackInput: UiFieldRenderer<TNode>
  /** 元数据未配 renderer 时的默认只读展示。 */
  fallbackDisplay: UiFieldRenderer<TNode>

  /**
   * 按会话/字段状态自动选编辑或显示，并套默认 `layout.layoutField`。
   * `editing && !readonly` → 等价 {@link editFor}；否则 → {@link displayFor}。
   * `buildFieldGroup` 与自定义屏默认走本方法。
   */
  render(
    field: MetaUiField,
    context: any,
    props?: Record<string, unknown>,
  ): TNode

  /**
   * 强制编辑行（标签 + 输入 + 校验）。
   * 控件：`customEditor` ?? `field.editor` ?? {@link fallbackInput}。
   */
  editFor(
    field: MetaUiField,
    context: any,
    props?: Record<string, unknown>,
  ): TNode

  /**
   * 强制只读行（标签 + 展示）。
   * 控件：`customRenderer` ?? `field.renderer`（bool 默认 checkedIcon）?? {@link fallbackDisplay}。
   */
  displayFor(
    field: MetaUiField,
    context: any,
    props?: Record<string, unknown>,
  ): TNode

  textSpan?: UiFieldRenderer<TNode>
  textInput?: UiFieldRenderer<TNode>
  textArea?: UiFieldRenderer<TNode>
  password?: UiFieldRenderer<TNode>
  numberInput?: UiFieldRenderer<TNode>
  percentInput?: UiFieldRenderer<TNode>
  positiveNumberInput?: UiFieldRenderer<TNode>
  negativenumberInput?: UiFieldRenderer<TNode>
  maskedTextBox?: UiFieldRenderer<TNode>
  oneTimePasswordInput?: UiFieldRenderer<TNode>
  mobileInput?: UiFieldRenderer<TNode>
  zipCodeInput?: UiFieldRenderer<TNode>

  datePicker?: UiFieldRenderer<TNode>
  dateTimePicker?: UiFieldRenderer<TNode>
  monthPicker?: UiFieldRenderer<TNode>
  timePicker?: UiFieldRenderer<TNode>
  dateRangePicker?: UiFieldRenderer<TNode>

  dropDownList?: UiFieldRenderer<TNode>
  comboBox?: UiFieldRenderer<TNode>
  autoComplete?: UiFieldRenderer<TNode>
  tagAutoComplete?: UiFieldRenderer<TNode>
  treeSelect?: UiFieldRenderer<TNode>
  radioButtonGroup?: UiFieldRenderer<TNode>
  multiSelect?: UiFieldRenderer<TNode>
  checkBoxList?: UiFieldRenderer<TNode>
  bitCheckBoxList?: UiFieldRenderer<TNode>

  checkBox?: UiFieldRenderer<TNode>
  switch?: UiFieldRenderer<TNode>
  slider?: UiFieldRenderer<TNode>
  rating?: UiFieldRenderer<TNode>
  colorPicker?: UiFieldRenderer<TNode>

  quantityUnit?: UiFieldRenderer<TNode>
  relativeTime?: UiFieldRenderer<TNode>
  percentage?: UiFieldRenderer<TNode>
  multilineText?: UiFieldRenderer<TNode>
  amountText?: UiFieldRenderer<TNode>

  fileLink?: UiFieldRenderer<TNode>
  externalLink?: UiFieldRenderer<TNode>
  hasOneText?: UiFieldRenderer<TNode>
  HasOneText?: UiFieldRenderer<TNode>

  fileUploader?: UiFieldRenderer<TNode>
  filesUploader?: UiFieldRenderer<TNode>
  imageUploader?: UiFieldRenderer<TNode>
  imagesUploader?: UiFieldRenderer<TNode>
  image?: UiFieldRenderer<TNode>

  progressBar?: UiFieldRenderer<TNode>
  signaturePad?: UiFieldRenderer<TNode>
  stepper?: UiFieldRenderer<TNode>
  inplaceFieldEditor?: UiFieldRenderer<TNode>
  chips?: UiFieldRenderer<TNode>
  tags?: UiFieldRenderer<TNode>
  enumChipSet?: UiFieldRenderer<TNode>
  bitChipSet?: UiFieldRenderer<TNode>
  colorBox?: UiFieldRenderer<TNode>
  checkIcon?: UiFieldRenderer<TNode>
  checkedIcon?: UiFieldRenderer<TNode>
}
