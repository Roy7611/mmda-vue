import type { MetaUiField } from '../metaui/metaui_field'
import type { Entity } from '../models/entity'
import type { UiContext } from './context'
import type { UiLayout } from './layout'
import type { UiProps } from './props'

/**
 * 表格单元格渲染的第三参。
 *
 * 为什么需要它：表格渲染时 `context` 是**整表（列表）会话**，`context.model` 是行数组，
 * 光靠 context 分不出"正在画哪一行"；当前行必须由调用方显式给。
 * 表单路径不传（那条路径下 context 就是该字段所在的会话，行 === `context.model`）。
 *
 * `row` 在 vui 里以不可枚举属性挂在 cellProps 上（避免透传进控件 / DOM），
 * 但**必须存在**：单元格渲染器读 `displayField(field, props.row)` 才能取到本行的值。
 */
export interface UiFieldCellProps extends UiProps {
  /** 当前渲染的行实体。 */
  row: Entity
  /** 该单元格是否出现在查询表单里（查询格不要链接、不要行级交互）。 */
  isSearch?: boolean
  /** 字段是否可点开跳转（元数据 `field.linkable` 与 isSearch 的对账结果）。 */
  linkable?: boolean
  /** 单元格标题（缺省用 `field.displayLabel`）。 */
  title?: string
}

/**
 * 字段级渲染函数（表单 / 详情 / 皮肤字段控件）。
 * 返回裸控件节点；带标签的字段行由 `UiBuilder.editFor` / `displayFor` 套 `UiLayout`。
 *
 * 第三参**可选是契约的一部分，不是兜底**：表格的只读格 / 编辑格在 `customCellRenderer` /
 * `customCellEditor` 缺失时会**回退**到 `customRenderer` / `customEditor`
 * （`packages/vui/src/ui/builder/list_view.ts` 的 `tableCell`），回退时同样传当前行。
 * 所以同一个函数既被两参（表单：`packages/core/src/ui/builder_base.ts`）又被三参（表格）调用。
 * 只跑表格那条路的写法用 {@link UiFieldCellRenderer}：第三参在类型上**必需**，写 `props.row` 时不必再 `props?.row` 兜底。
 */
export type UiFieldRenderer<TNode = any> = (
  field: MetaUiField,
  context: UiContext,
  props?: UiFieldCellProps,
) => TNode

/**
 * 单元格级渲染函数（表格专用）。
 * 只在表格里跑：`MetaUiFieldLogic.customCellRenderer` / `customCellEditor`。
 * 第三参**必需** —— 表格渲染时 `context` 是整表会话，当前行只能从第三参拿。
 * 与 {@link UiFieldRenderer} 分开写，是因为表格（可能上千行）常要更轻的实现，
 * 而详情/表单字段可以更丰富。
 */
export type UiFieldCellRenderer<TNode = any> = (
  field: MetaUiField,
  context: UiContext,
  props: UiFieldCellProps,
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
