import type { ReactNode } from 'react'
import type { UiFieldFactory, UiFieldRenderer } from '@mmda/core'

const stubField: UiFieldRenderer<ReactNode> = () => null

/**
 * Syncfusion EJ2 React 字段控件工厂。实现 core {@link UiFieldFactory}。
 * 尚未实现，所有字段控件先 stub 返回 null。
 */
export class SfReactUiFieldFactory implements UiFieldFactory<ReactNode> {
  [key: string]: UiFieldRenderer<ReactNode>

  fallbackInput = stubField
  fallbackDisplay = stubField
  textSpan = stubField
  textInput = stubField
  textArea = stubField
  password = stubField
  numberInput = stubField
  percentInput = stubField
  positiveNumberInput = stubField
  negativeNumberInput = stubField
  maskedTextBox = stubField
  oneTimePasswordInput = stubField
  mobileInput = stubField
  zipCodeInput = stubField
  datePicker = stubField
  dateTimePicker = stubField
  monthPicker = stubField
  timePicker = stubField
  dateRangePicker = stubField
  dropDownList = stubField
  comboBox = stubField
  autoComplete = stubField
  tagAutoComplete = stubField
  treeSelect = stubField
  radioButtonGroup = stubField
  multiSelect = stubField
  checkBoxList = stubField
  bitCheckBoxList = stubField
  checkBox = stubField
  switch = stubField
  slider = stubField
  rating = stubField
  colorPicker = stubField
  quantityUnit = stubField
  relativeTime = stubField
  percentage = stubField
  multilineText = stubField
  amountText = stubField
  fileLink = stubField
  externalLink = stubField
  hasOneText = stubField
  HasOneText = stubField
  fileUploader = stubField
  filesUploader = stubField
  imageUploader = stubField
  imagesUploader = stubField
  image = stubField
  avatar = stubField
  progressBar = stubField
  signaturePad = stubField
  stepper = stubField
  inPlaceFieldEditor = stubField
  chips = stubField
  tags = stubField
  enumChipSet = stubField
  bitChipSet = stubField
  colorBox = stubField
  checkIcon = stubField
  checkedIcon = stubField
}
