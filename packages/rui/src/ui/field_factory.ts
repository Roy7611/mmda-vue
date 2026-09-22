import { createElement, type ReactNode } from 'react'
import {
  SqlDataType,
  isInplaceFieldEditorKey,
  type MetaUiField,
  type UiContext,
  type UiFieldFactory,
  type UiFieldRenderer,
  type UiProps,
  autoCompleteBindValue,
  autoCompletePropsFromField,
  routeAutoCompleteField,
  avatarPropsFromField,
  checkBoxPropsFromField,
  switchPropsFromField,
  numberInputPropsFromField,
  textAreaPropsFromField,
  textInputPropsFromField,
  progressBarPropsFromField,
  signaturePadPropsFromField,
  stepperPropsFromField,
  datePickerPropsFromField,
  dateRangePickerPropsFromField,
  dateTimePickerPropsFromField,
  monthPickerPropsFromField,
  timePickerPropsFromField,
  comboBoxPropsFromField,
  dropDownListPropsFromField,
  radioButtonGroupPropsFromField,
  multiSelectPropsFromField,
  multiItemSelectPropsFromField,
  multiValueSelectPropsFromField,
  multiTextSelectPropsFromField,
  multiBitSelectPropsFromField,
  checkBoxListPropsFromField,
  bitCheckBoxListPropsFromField,
  tagAutoCompletePropsFromField,
  chipsPropsFromField,
  bitChipSetPropsFromField,
  enumChipSetPropsFromField,
  colorPickerPropsFromField,
  maskedTextBoxPropsFromField,
  oneTimePasswordPropsFromField,
  sliderPropsFromField,
  ratingPropsFromField,
  treeSelectPropsFromField,
  fileLinkPropsFromField,
  fileUploaderPropsFromField,
  filesUploaderPropsFromField,
  imageUploaderPropsFromField,
  imagesUploaderPropsFromField,
  MOBILE_MASK,
  ZIP_MASK,
} from '@mmda/core'
import { ReactUiFactory } from './factory'

const fieldDisplayText = (
  field: MetaUiField,
  context: UiContext,
): string => {
  const value = context.displayField(field)
  return value == null ? '' : String(value)
}

/**
 * React 字段工厂基类。
 *
 * 每个字段成员只做两件事：用 core 的 `*PropsFromField` 把 `MetaUiField`
 * 译成 `UiXxxProps`，然后交给皮肤 `factory.xxx` 渲染。因此 React 皮肤只需要
 * 提供 factory，不再重复写字段到控件的映射。
 */
export class ReactUiFieldFactory implements UiFieldFactory<ReactNode> {
  [key: string]: any

  constructor(protected readonly factory: ReactUiFactory) {}

  protected control(
    field: MetaUiField,
    context: UiContext,
    node: ReactNode,
  ): ReactNode {
    const invalid = Boolean(context.isInvalid?.(field))
    return createElement(
      'div',
      { className: invalid ? 'mmda-control is-invalid' : 'mmda-control' },
      node,
      invalid
        ? createElement(
            'span',
            { className: 'e-error' },
            context.getInvalidMessage?.(field),
          )
        : null,
    )
  }

  protected searchRelative(
    field: MetaUiField,
    context: UiContext,
  ): ReactNode {
    const reference = field.reference
    return this.factory.searchRelative({
      modelValue: context.getFieldValue(field),
      toSearch: () => context.select(field),
      optionLabel: undefined,
      dataKey: reference?.refFlds?.[0] ?? 'value',
      placeholder: field.placeholder,
      onUpdate: (value) => context.setFieldValue(field, value),
    })
  }

  fallbackInput: UiFieldRenderer<ReactNode> = (field, context) => {
    if (
      field.reference &&
      (field.reference.hasOne ||
        (field.reference.isRef && field.reference.refRepository))
    ) {
      return this.searchRelative(field, context)
    }
    if (field.reference?.refOptions?.length) {
      return this.dropDownList(field, context)
    }
    if (SqlDataType.isBool(field.dataType)) return this.checkBox(field, context)
    if (SqlDataType.isNum(field.dataType)) return this.numberInput(field, context)
    if (SqlDataType.isDate(field.dataType)) return this.datePicker(field, context)
    return this.textInput(field, context)
  }

  fallbackDisplay: UiFieldRenderer<ReactNode> = (field, context) =>
    this.factory.textSpan({ text: fieldDisplayText(field, context) })

  textSpan = this.fallbackDisplay

  textInput: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.textInput(textInputPropsFromField(field, context)),
    )

  textArea: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.textArea(textAreaPropsFromField(field, context)),
    )

  password: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.textInput({
        ...textInputPropsFromField(field, context),
        type: 'Password',
      }),
    )

  numberInput: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.numberInput(numberInputPropsFromField(field, context)),
    )

  percentInput: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.numberInput({
        ...numberInputPropsFromField(field, context),
        kind: 'percent',
      }),
    )

  positiveNumberInput: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.numberInput({
        ...numberInputPropsFromField(field, context),
        min: 0,
      }),
    )

  negativeNumberInput: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.numberInput({
        ...numberInputPropsFromField(field, context),
        max: 0,
      }),
    )

  maskedTextBox: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.maskedTextBox(maskedTextBoxPropsFromField(field, context)),
    )

  oneTimePasswordInput: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.oneTimePasswordInput(
        oneTimePasswordPropsFromField(field, context),
      ),
    )

  mobileInput: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.maskedTextBox(
        maskedTextBoxPropsFromField(field, context, { mask: MOBILE_MASK }),
      ),
    )

  zipCodeInput: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.maskedTextBox(
        maskedTextBoxPropsFromField(field, context, { mask: ZIP_MASK }),
      ),
    )

  datePicker: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.datePicker(datePickerPropsFromField(field, context)),
    )

  dateTimePicker: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.dateTimePicker(dateTimePickerPropsFromField(field, context)),
    )

  monthPicker: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.monthPicker(monthPickerPropsFromField(field, context)),
    )

  timePicker: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.timePicker(timePickerPropsFromField(field, context)),
    )

  dateRangePicker: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.dateRangePicker(
        dateRangePickerPropsFromField(field, context),
      ),
    )

  dropDownList: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.dropDownList(dropDownListPropsFromField(field, context)),
    )

  comboBox: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.comboBox(comboBoxPropsFromField(field, context)),
    )

  autoComplete: UiFieldRenderer<ReactNode> = (field, context) => {
    const route = routeAutoCompleteField(field)
    if (route === 'dropDownList') return this.dropDownList(field, context)
    if (route === 'searchBox') return this.searchRelative(field, context)
    const reference = field.reference?.isRef ? field.reference : undefined
    return this.control(
      field,
      context,
      this.factory.autoComplete({
        value: autoCompleteBindValue(context.getFieldValue(field), {
          reference,
        }),
        ...autoCompletePropsFromField(field),
        disabled: context.isFieldReadonly(field),
        onChange: (value) => context.setFieldValue(field, value),
      }),
    )
  }

  tagAutoComplete: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.tagAutoComplete(tagAutoCompletePropsFromField(field, context)),
    )

  treeSelect: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.treeSelect(treeSelectPropsFromField(field, context)),
    )

  radioButtonGroup: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.radioButtonGroup(
        radioButtonGroupPropsFromField(field, context),
      ),
    )

  multiSelect: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.multiSelect(multiSelectPropsFromField(field, context)),
    )

  multiItemSelect: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.multiItemSelect(
        multiItemSelectPropsFromField(field, context),
      ),
    )

  multiValueSelect: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.multiValueSelect(
        multiValueSelectPropsFromField(field, context),
      ),
    )

  multiTextSelect: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.multiTextSelect(
        multiTextSelectPropsFromField(field, context),
      ),
    )

  multiBitSelect: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.multiBitSelect(multiBitSelectPropsFromField(field, context)),
    )

  checkBoxList: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.checkBoxList(checkBoxListPropsFromField(field, context)),
    )

  bitCheckBoxList: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.bitCheckBoxList(
        bitCheckBoxListPropsFromField(field, context),
      ),
    )

  checkBox: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.checkBox(checkBoxPropsFromField(field, context)),
    )

  switch: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.switch(switchPropsFromField(field, context)),
    )

  slider: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.slider(sliderPropsFromField(field, context)),
    )

  rating: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.rating(ratingPropsFromField(field, context)),
    )

  colorPicker: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.colorPicker(colorPickerPropsFromField(field, context)),
    )

  quantityUnit: UiFieldRenderer<ReactNode> = (field, context) => {
    const value = context.getFieldValue(field)
    const unit = field.suffix?.trim()
    const text =
      value == null || value === ''
        ? (field.nullDisplayText ?? '')
        : unit
          ? `${String(value)} ${unit}`
          : String(value)
    return createElement('span', { className: 'mmda-quantity-unit' }, text)
  }

  relativeTime: UiFieldRenderer<ReactNode> = (field, context) =>
    createElement(
      'span',
      null,
      String(context.getFieldValue(field) ?? ''),
    )

  percentage: UiFieldRenderer<ReactNode> = (field, context) =>
    createElement(
      'span',
      null,
      `${Number(context.getFieldValue(field) ?? 0) * 100}%`,
    )

  multilineText: UiFieldRenderer<ReactNode> = (field, context) =>
    createElement(
      'span',
      { style: { whiteSpace: 'pre-wrap' } },
      fieldDisplayText(field, context),
    )

  amountText = this.fallbackDisplay

  fileLink: UiFieldRenderer<ReactNode> = (field, context) =>
    this.factory.fileLink(fileLinkPropsFromField(field, context))

  externalLink: UiFieldRenderer<ReactNode> = (field, context) =>
    this.fileLink(field, context)

  hasOneText = this.externalLink
  HasOneText = this.externalLink

  fileUploader: UiFieldRenderer<ReactNode> = (field, context) => {
    const props = fileUploaderPropsFromField(field, context)
    if (props.readOnly) {
      return this.factory.fileLink(fileLinkPropsFromField(field, context))
    }
    return this.factory.fileUploader(props)
  }

  filesUploader: UiFieldRenderer<ReactNode> = (field, context) =>
    this.factory.filesUploader(filesUploaderPropsFromField(field, context))

  imageUploader: UiFieldRenderer<ReactNode> = (field, context) => {
    const props = imageUploaderPropsFromField(field, context)
    if (props.readOnly) {
      return this.factory.image({ src: String(context.getFieldValue(field) ?? '') })
    }
    return this.factory.imageUploader(props)
  }

  imagesUploader: UiFieldRenderer<ReactNode> = (field, context) =>
    this.factory.imagesUploader(imagesUploaderPropsFromField(field, context))

  image: UiFieldRenderer<ReactNode> = (field, context) =>
    this.factory.image({ src: String(context.getFieldValue(field) ?? '') })

  avatar: UiFieldRenderer<ReactNode> = (field, context) =>
    this.factory.avatar(avatarPropsFromField(field, context))

  progressBar: UiFieldRenderer<ReactNode> = (field, context) =>
    this.factory.progressBar(progressBarPropsFromField(field, context))

  signaturePad: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.signaturePad(signaturePadPropsFromField(field, context)),
    )

  stepper: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.stepper(stepperPropsFromField(field, context)),
    )

  inPlaceFieldEditor: UiFieldRenderer<ReactNode> = (field, context) => {
    const display = this.fieldDisplayRenderer(field)
    const content = this.fieldEditorRenderer(field)
    if (context.isFieldReadonly(field)) return display(field, context)
    return this.factory.inplaceEditor(
      { disabled: false },
      {
        display: () => display(field, context),
        content: () => content(field, context),
      },
    )
  }

  chips: UiFieldRenderer<ReactNode> = (field, context) =>
    this.factory.chips(chipsPropsFromField(field, context))

  tags = this.chips

  enumChipSet: UiFieldRenderer<ReactNode> = (field, context) =>
    this.factory.chips(enumChipSetPropsFromField(field, context))

  bitChipSet: UiFieldRenderer<ReactNode> = (field, context) =>
    this.factory.chips(bitChipSetPropsFromField(field, context))

  colorBox: UiFieldRenderer<ReactNode> = (field, context) =>
    createElement('span', {
      title: String(context.getFieldValue(field) ?? ''),
      style: {
        display: 'inline-block',
        width: '1.5rem',
        height: '1.5rem',
        backgroundColor: String(context.getFieldValue(field) ?? 'transparent'),
      },
    })

  checkIcon: UiFieldRenderer<ReactNode> = (field, context) =>
    this.booleanIcon(context.getFieldValue(field))

  checkedIcon: UiFieldRenderer<ReactNode> = (field, context) =>
    this.booleanIcon(context.getFieldValue(field))

  private booleanIcon(value: unknown): ReactNode {
    return createElement('i', {
      className: value ? 'e-icons e-circle-check' : 'e-icons e-circle',
    })
  }

  private fieldDisplayRenderer(field: MetaUiField): UiFieldRenderer<ReactNode> {
    if (
      field.renderer &&
      !isInplaceFieldEditorKey(field.renderer) &&
      typeof this[field.renderer] === 'function'
    ) {
      return this[field.renderer]
    }
    return this.fallbackDisplay
  }

  private fieldEditorRenderer(field: MetaUiField): UiFieldRenderer<ReactNode> {
    if (
      field.editor &&
      !isInplaceFieldEditorKey(field.editor) &&
      typeof this[field.editor] === 'function'
    ) {
      return this[field.editor]
    }
    return this.fallbackInput
  }
}
