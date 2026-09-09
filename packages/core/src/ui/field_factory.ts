import type { MetaUiField } from '../metaui/metaui_field'

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
 * Logic / MetaUi 会点到的键在此声明（camelCase）；PascalCase 别名只留皮肤。
 */
export interface UiFieldFactory<TNode = any>
  extends Record<string, UiFieldRenderer<TNode> | undefined> {
  fallbackDisplay: UiFieldRenderer<TNode>
  fallbackInput: UiFieldRenderer<TNode>

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
  timeline?: UiFieldRenderer<TNode>
  inplaceFieldEditor?: UiFieldRenderer<TNode>
  chips?: UiFieldRenderer<TNode>
  tags?: UiFieldRenderer<TNode>
  enumChipSet?: UiFieldRenderer<TNode>
  bitChipSet?: UiFieldRenderer<TNode>
  colorBox?: UiFieldRenderer<TNode>
  checkIcon?: UiFieldRenderer<TNode>
  checkedIcon?: UiFieldRenderer<TNode>
}
