import type { MetaUiField } from '../metaui/metaui_field'
import type { UiContext } from './context'
import type { UiLayout } from './layout'

/**
 * 单个字段的渲染函数。
 * 返回裸控件节点；带标签的字段行由 `UiBuilder.editFor` / `displayFor` 套 `UiLayout`。
 */
export type UiFieldRenderer<TNode = any> = (
  field: MetaUiField,
  context: UiContext,
) => TNode

/**
 * 字段读写；`*PropsFromField` 用。
 *
 * 签名**借用** `UiContext`（同一个主人），不要各写一份 —— 手抄一遍就会因为参数反变对不上
 * （`getFieldValue` 第二参写 `unknown` 就吃不下 `Entity`）。
 */
export type UiFieldBindContext = Pick<
  UiContext<any>,
  'getFieldValue' | 'setFieldValue' | 'isFieldReadonly'
> &
  Partial<Pick<UiContext<any>, 't' | 'model' | 'searchRelative'>>

/**
 * 字段渲染器表。皮肤用编辑器/renderer 名做索引。
 *
 * 这里**只放控件**（裸控件）。带标签的字段行在 `UiBuilder`：builder 构表单时按 `MetaUiField`
 * 选这里的函数，再套 `UiLayout` 排（`editFor` / `displayFor`）。
 * - 具名方法（`textInput` 等）：裸控件，表格单元格用这些
 * - {@link fallbackInput} / {@link fallbackDisplay}：元数据没配时的兜底
 *
 */
export interface UiFieldFactory<TNode = any>
  extends Record<string, UiFieldRenderer<TNode>> {
  /** 元数据未配 editor 时的默认输入控件。 */
  fallbackInput: UiFieldRenderer<TNode>
  /** 元数据未配 renderer 时的默认只读展示。 */
  fallbackDisplay: UiFieldRenderer<TNode>

  textSpan: UiFieldRenderer<TNode>
  textInput: UiFieldRenderer<TNode>
  textArea: UiFieldRenderer<TNode>
  password: UiFieldRenderer<TNode>
  numberInput: UiFieldRenderer<TNode>
  percentInput: UiFieldRenderer<TNode>
  positiveNumberInput: UiFieldRenderer<TNode>
  negativeNumberInput: UiFieldRenderer<TNode>
  maskedTextBox: UiFieldRenderer<TNode>
  oneTimePasswordInput: UiFieldRenderer<TNode>
  mobileInput: UiFieldRenderer<TNode>
  zipCodeInput: UiFieldRenderer<TNode>

  datePicker: UiFieldRenderer<TNode>
  dateTimePicker: UiFieldRenderer<TNode>
  monthPicker: UiFieldRenderer<TNode>
  timePicker: UiFieldRenderer<TNode>
  dateRangePicker: UiFieldRenderer<TNode>

  dropDownList: UiFieldRenderer<TNode>
  comboBox: UiFieldRenderer<TNode>
  autoComplete: UiFieldRenderer<TNode>
  tagAutoComplete: UiFieldRenderer<TNode>
  treeSelect: UiFieldRenderer<TNode>
  radioButtonGroup: UiFieldRenderer<TNode>
  multiSelect: UiFieldRenderer<TNode>
  checkBoxList: UiFieldRenderer<TNode>
  bitCheckBoxList: UiFieldRenderer<TNode>

  checkBox: UiFieldRenderer<TNode>
  switch: UiFieldRenderer<TNode>
  slider: UiFieldRenderer<TNode>
  rating: UiFieldRenderer<TNode>
  colorPicker: UiFieldRenderer<TNode>

  quantityUnit: UiFieldRenderer<TNode>
  relativeTime: UiFieldRenderer<TNode>
  percentage: UiFieldRenderer<TNode>
  multilineText: UiFieldRenderer<TNode>
  amountText: UiFieldRenderer<TNode>

  fileLink: UiFieldRenderer<TNode>
  externalLink: UiFieldRenderer<TNode>
  hasOneText: UiFieldRenderer<TNode>
  HasOneText: UiFieldRenderer<TNode>

  fileUploader: UiFieldRenderer<TNode>
  filesUploader: UiFieldRenderer<TNode>
  imageUploader: UiFieldRenderer<TNode>
  imagesUploader: UiFieldRenderer<TNode>
  image: UiFieldRenderer<TNode>
  avatar: UiFieldRenderer<TNode>

  progressBar: UiFieldRenderer<TNode>
  signaturePad: UiFieldRenderer<TNode>
  stepper: UiFieldRenderer<TNode>
  inplaceFieldEditor: UiFieldRenderer<TNode>
  chips: UiFieldRenderer<TNode>
  tags: UiFieldRenderer<TNode>
  enumChipSet: UiFieldRenderer<TNode>
  bitChipSet: UiFieldRenderer<TNode>
  colorBox: UiFieldRenderer<TNode>
  checkIcon: UiFieldRenderer<TNode>
  checkedIcon: UiFieldRenderer<TNode>
}
