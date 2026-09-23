import { h, type VNode } from 'vue'
import {
  autoCompleteBindValue,
  autoCompletePropsFromField,
  avatarPropsFromField,
  routeAutoCompleteField,
  type MetaUiField,
  type UiAvatarProps,
  type UiAutoCompleteProps,
  type UiContext,
  type UiFieldCellProps,
  type UiFieldFactory,
} from '@mmda/core'
import {
  VueUiFieldFactory,
  type VuiContext,
  type VuiFactory,
  type VuiFieldRenderer,
  type VuiSearchRelativeProps,
} from '@mmda/vui'
import { createPrimeVuiFactory } from './prime_factory'
import { createSearchRelative as renderSearchRelative } from './factory/search_relative'
import Image from 'primevue/image'
import Message from 'primevue/message'
import Password from 'primevue/password'
import Tag from 'primevue/tag'

/**
 * PrimeVue 字段工厂。
 *
 * `MetaUiField -> UiXxxProps -> factory.xxx` 的通用映射已在 @mmda/vui 的
 * {@link VueUiFieldFactory} 完成；本类只绑定 PrimeVue factory，并保留
 * PrimeVue 特有的错误提示、Password / Image / Tag、SearchBox、头像尺寸和图标。
 */
export class PrimeVueFieldFactory extends VueUiFieldFactory {
  constructor(factory: VuiFactory = createPrimeVuiFactory() as unknown as VuiFactory) {
    super(factory)
  }

  protected control(field: MetaUiField, context: UiContext, node: VNode): VNode {
    const invalid = Boolean(context.isInvalid?.(field))
    return h('div', { class: ['mmda-control', invalid && 'is-invalid'] }, [
      node,
      invalid
        ? h(Message as any, { severity: 'error', size: 'small', variant: 'simple' }, () =>
            context.getInvalidMessage?.(field),
          )
        : null,
    ])
  }

  protected createSearchRelative(
    field: MetaUiField,
    context: VuiContext<any>,
    props: VuiSearchRelativeProps,
  ): VNode {
    return renderSearchRelative(field, context, props)
  }

  password: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      h(Password as any, {
        modelValue: context.getFieldValue(field),
        inputId: field.fieldName,
        id: field.fieldName,
        name: field.fieldName,
        disabled: context.isFieldReadonly(field),
        readonly: context.isFieldReadonly(field),
        required: context.isFieldRequired(field),
        invalid: Boolean(context.isInvalid?.(field)),
        placeholder: field.placeholder,
        maxlength: field.maxLength,
        fluid: true,
        feedback: true,
        toggleMask: true,
        'onUpdate:modelValue': (value: any) => context.setFieldValue(field, value),
      }),
    )

  autoComplete: VuiFieldRenderer = (field, context, props) => {
    const route = routeAutoCompleteField(field)
    if (route === 'dropDownList') return this.dropDownList(field, context)
    if (route === 'searchBox') return this.searchRelative(field, context, props)

    const reference = field.reference?.isRef ? field.reference : undefined
    const autoCompleteProps = {
      value: autoCompleteBindValue(context.getFieldValue(field), { reference }),
      ...autoCompletePropsFromField(field),
      disabled: context.isFieldReadonly(field),
      onUpdate: (value: any) => context.setFieldValue(field, value),
    } as UiAutoCompleteProps & { onUpdate?: (value: any) => void }
    return this.control(field, context, this.factory.autoComplete(autoCompleteProps))
  }

  tag: VuiFieldRenderer = (field, context, props) =>
    h(Tag as any, {
      value: context.displayField(field, props?.row),
      severity: (props as { severity?: any } | undefined)?.severity,
      ...props,
    })

  statusLight = this.tag

  image: VuiFieldRenderer = (field, context, props) =>
    h(Image as any, {
      src: context.getFieldValue(field, props?.row),
      preview: true,
      ...props,
    })

  avatar: VuiFieldRenderer = (field, context, props) => {
    const cell = props as UiAvatarProps | undefined
    const avatarProps: UiAvatarProps = {
      ...avatarPropsFromField(field, context),
      ...(cell ? { size: cell.size ?? 'small' } : {}),
    }
    return this.factory.avatar(avatarProps)
  }

  checkIcon: VuiFieldRenderer = (field, context, props) =>
    this.primeBooleanIcon(context.getFieldValue(field, props?.row), props)

  checkedIcon: VuiFieldRenderer = (field, context, props) =>
    this.primeBooleanIcon(context.getFieldValue(field, props?.row), props)

  private primeBooleanIcon(value: unknown, props?: UiFieldCellProps): VNode {
    const checked = Boolean(value)
    return h('i', {
      ...props,
      class: checked ? 'pi pi-check-circle p-text-success' : 'pi pi-circle',
    })
  }

  // —— 老 metadata 编辑器名 / 皮肤别名 ——

  select = this.dropDownList
  span = this.fallbackDisplay
  searchInput = this.textInput
  switcher = this.switch
  Switcher = this.switch
  checkbox = this.checkBox
  negativenumberInput = this.negativeNumberInput
  enumSetCheckboxGroup = this.multiBitSelect
  filePicker = this.fileUploader
  fileUpload = this.filesUploader
  imagePicker = this.imageUploader
  toHoursInput = this.numberInput
  toMinutesInput = this.numberInput
  toSecondsInput = this.numberInput

  TextBox = this.textInput
  TextField = this.textInput
  TextArea = this.textArea
  AutoComplete = this.autoComplete
  TagAutoComplete = this.tagAutoComplete
  DropDownList = this.dropDownList
  RadioButtonGroup = this.radioButtonGroup
  Combobox = this.comboBox
  DatePicker = this.datePicker
  DateTimePicker = this.dateTimePicker
  MonthPicker = this.monthPicker
  TimePicker = this.timePicker
  DateRangePicker = this.dateRangePicker
  NumberInput = this.numberInput
  ToHoursInput = this.toHoursInput
  ToMinutesInput = this.toMinutesInput
  ToSecondsInput = this.toSecondsInput
  PositiveNumberInput = this.positiveNumberInput
  NegativenumberInput = this.negativenumberInput
  PercentInput = this.percentInput
  SpinBox = this.numberInput
  CheckBox = this.checkBox
  Checkbox = this.checkBox
  Switch = this.switch
  SearchBox = this.searchBox
  CheckBoxList = this.checkBoxList
  BitCheckBoxList = this.bitCheckBoxList
  MultiSelect = this.multiSelect
  MultiItemSelect = this.multiItemSelect
  MultiValueSelect = this.multiValueSelect
  MultiTextSelect = this.multiTextSelect
  MultiBitSelect = this.multiBitSelect
  Slider = this.slider
  Rating = this.rating
  ColorPicker = this.colorPicker
  FilePicker = this.filePicker
  FileUpload = this.fileUpload
  FileUploader = this.fileUploader
  FilesUploader = this.filesUploader
  ImagePicker = this.imagePicker
  ImageUploader = this.imageUploader
  ImagesUploader = this.imagesUploader
  FileLink = this.fileLink
  Url = this.fileLink
  InplaceFieldEditor = this.inplaceFieldEditor
  MultilineText = this.multilineText
  Percentage = this.percentage
  AmountText = this.amountText
  QuantityUnit = this.quantityUnit
  Tag = this.tag
  Tags = this.tags
  Chips = this.chips
  BitChipSet = this.bitChipSet
  EnumChipSet = this.enumChipSet
  CheckIcon = this.checkIcon
  CheckedIcon = this.checkedIcon
  HasOneText = this.externalLink
  hasOneText = this.externalLink
  ColorBox = this.colorBox
  ProgressBar = this.progressBar
  SignaturePad = this.signaturePad
  Stepper = this.stepper
  RelativeTime = this.relativeTime
  Image = this.image
  Avatar = this.avatar
  StatusLight = this.statusLight
}

export const primeVueFieldFactory: UiFieldFactory = new PrimeVueFieldFactory()

export function createPrimeVueFieldFactory(): PrimeVueFieldFactory {
  return new PrimeVueFieldFactory()
}
