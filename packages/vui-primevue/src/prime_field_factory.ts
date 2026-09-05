import { h, mergeProps, type Component, type VNode } from 'vue'
import {
  SqlDataType,
  MetaModel,
  type MetaUiField,
  type Module,
} from '@mmda/core'
import {
  cleanProps,
  fasIcon,
  TABLE_CELL_PROP_KEYS,
  type PropData,
  type UiFieldFactory,
  type UiViewContext,
} from '@mmda/vui'
import Checkbox from 'primevue/checkbox'
import ColorPicker from 'primevue/colorpicker'
import DatePicker from 'primevue/datepicker'
import FileUpload from 'primevue/fileupload'
import Image from 'primevue/image'
import InputMask from 'primevue/inputmask'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import MultiSelect from 'primevue/multiselect'
import Password from 'primevue/password'
import ProgressBar from 'primevue/progressbar'
import Select from 'primevue/select'
import Slider from 'primevue/slider'
import Tag from 'primevue/tag'
import Chip from 'primevue/chip'
import Textarea from 'primevue/textarea'
import ToggleSwitch from 'primevue/toggleswitch'

type UiContext = UiViewContext<any>

const update = (field: MetaUiField, context: UiContext) => (value: any) =>
  context.setFieldValue(field, value)

const invalidOf = (field: MetaUiField, context: UiContext) =>
  Boolean((context as any).isInvalid?.(field))

const control = (
  component: Component,
  field: MetaUiField,
  context: UiContext,
  props: PropData = {},
  extra: PropData = {},
) => {
  const invalid = invalidOf(field, context)
  return h('div', { class: ['mmda-prime-control', invalid && 'is-invalid'] }, [
    h(component, {
      inputId: field.fieldName,
      id: field.fieldName,
      name: field.fieldName,
      modelValue: context.getFieldValue(field),
      disabled: context.isFieldReadonly(field),
      readonly: context.isFieldReadonly(field),
      required: context.isFieldRequired(field),
      invalid,
      placeholder: field.placeholder,
      maxlength: field.maxLength,
      fluid: true,
      ...extra,
      ...props,
      'onUpdate:modelValue':
        props['onUpdate:modelValue'] ?? update(field, context),
    }),
    invalid &&
      h(Message, { severity: 'error', size: 'small', variant: 'simple' }, () =>
        (context as any).getInvalidMessage?.(field),
      ),
  ])
}

const textInput = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(InputText, field, context, props)

const textArea = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(Textarea, field, context, props, { autoResize: true, rows: 3 })

const password = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(Password, field, context, props, {
    feedback: true,
    toggleMask: true,
  })

const dropdown = (field: MetaUiField, context: UiContext, props?: PropData) => {
  const reference = field.reference
  if (!reference) {
    return control(Select, field, context, props, {
      options: props?.options ?? [],
      optionLabel: props?.optionLabel,
      optionValue: props?.optionValue,
      filter: true,
      showClear: field.nullable,
    })
  }
  // 对齐老代码：不设 optionValue，modelValue 为 getFieldValue 整对象（HAS_ONE 导航 / REF getRefObject）
  const refFlds = reference.refFlds?.length ? reference.refFlds : ['value', 'text']
  const valueKey = refFlds[0] ?? 'value'
  const labelKey = refFlds[1] ?? valueKey
  return control(Select, field, context, props, {
    options: reference.refOptions ?? props?.options ?? [],
    optionLabel:
      refFlds.length > 2
        ? (option: any) => reference.labelOf(option)
        : labelKey,
    dataKey: valueKey,
    filter: true,
    showClear: field.nullable,
  })
}

const multiSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => {
  const reference = field.reference
  if (!reference) {
    return control(MultiSelect, field, context, props, {
      options: props?.options ?? [],
      optionLabel: props?.optionLabel,
      filter: true,
      display: 'chip',
    })
  }
  const refFlds = reference.refFlds?.length ? reference.refFlds : ['value', 'text']
  const valueKey = refFlds[0] ?? 'value'
  const labelKey = refFlds[1] ?? valueKey
  return control(MultiSelect, field, context, props, {
    options: reference.refOptions ?? props?.options ?? [],
    optionLabel:
      refFlds.length > 2
        ? (option: any) => reference.labelOf(option)
        : labelKey,
    dataKey: valueKey,
    filter: true,
    display: 'chip',
  })
}

const numberInput = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(InputNumber, field, context, props, {
    minFractionDigits: (field as any).scale,
    maxFractionDigits: (field as any).scale,
    useGrouping: false,
  })

const percentInput = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(InputNumber, field, context, props, {
    mode: 'decimal',
    suffix: '%',
    min: 0,
    max: 100,
  })

const checkbox = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(Checkbox, field, context, props, { binary: true, fluid: false })

const switcher = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(ToggleSwitch, field, context, props, { fluid: false })

const datePicker = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(DatePicker, field, context, props, {
    dateFormat: 'yy-mm-dd',
    showIcon: true,
  })

const dateTimePicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(DatePicker, field, context, props, {
    dateFormat: 'yy-mm-dd',
    showTime: true,
    showSeconds: true,
    hourFormat: '24',
    showIcon: true,
  })

const monthPicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(DatePicker, field, context, props, {
    view: 'month',
    dateFormat: 'yy-mm',
    showIcon: true,
  })

const timePicker = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(DatePicker, field, context, props, {
    timeOnly: true,
    showSeconds: true,
    hourFormat: '24',
  })

const fallbackDisplay = (
  field: MetaUiField,
  context: UiContext,
  props: PropData = {},
) =>
  h(
    'output',
    { class: 'mmda-prime-display', ...props },
    String(context.displayField(field, props.row) ?? ''),
  )

const fallbackInput = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
): VNode => {
  if (
    field.reference &&
    (field.reference.hasOne ||
      (field.reference.isRef && field.reference.refRepository))
  ) {
    return searchBox(field, context, props)
  }
  if (field.reference?.refOptions?.length)
    return dropdown(field, context, props)
  if (SqlDataType.isBool(field.dataType)) return checkbox(field, context, props)
  if (SqlDataType.isNum(field.dataType))
    return numberInput(field, context, props)
  if (SqlDataType.isDate(field.dataType))
    return datePicker(field, context, props)
  return textInput(field, context, props)
}

/** HAS_ONE / 远程 REF：对齐老 SearchBox。 */
const searchBox = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
): VNode => {
  const reference = field.reference
  if (!reference) {
    return h('span', { class: 'warning' }, '不是引用字段')
  }
  const builder = context.uiBuilder
  if (!builder?.buildSearchForRelative) {
    return fallbackDisplay(field, context, props)
  }
  const valueKey = reference.refFlds?.[0] ?? 'value'
  const labelKey = reference.refFlds?.[1] ?? valueKey
  const fldOptions = context.getFieldOptions(field)
  let fieldValue = (context.model as Record<string, unknown>)[field.fieldName]
    ? context.getFieldValue(field)
    : null
  if (
    fieldValue &&
    typeof fieldValue === 'object' &&
    (fieldValue as Record<string, unknown>)[valueKey] == 0
  ) {
    fieldValue = null
  }
  if (fieldValue && typeof fieldValue === 'object') {
    const key = reference.valueOf(fieldValue)
    if (
      !fldOptions.selectOptions.some(item => reference.valueOf(item) === key)
    ) {
      fldOptions.selectOptions.unshift(fieldValue)
    }
    fldOptions.currentSelectOption = fieldValue
  }
  return builder.buildSearchForRelative(context, field, {
    modelValue: fldOptions.currentSelectOption ?? fieldValue,
    showClear: Boolean(fldOptions.currentSelectOption ?? fieldValue),
    options: fldOptions.selectOptions,
    title: props?.title ?? field.displayLabel,
    dataKey: valueKey,
    optionLabel:
      reference.refFlds.length > 2
        ? (data: any) => reference.labelOf(data)
        : labelKey,
    invalid: invalidOf(field, context),
    onChange: (value: any) => {
      fldOptions.currentSelectOption = value || null
      context.setFieldValue(field, value || null)
      if (!value) {
        const model = context.model as Record<string, any>
        MetaModel.setRefProp(model, field.fieldName, null)
        reference.refFlds.forEach((rf, index) => {
          if (index > 0) MetaModel.delCustomProp(model, rf)
        })
        if (reference.hasOne && reference.alias) model[reference.alias] = null
      }
    },
    onInput: (value: string) => {
      if (fldOptions.isComposing) return
      void context.searchRelative(field, value)
    },
    toSearch: async () => {
      const picked = await (context as any).pickRelative?.(field)
      if (picked) fldOptions.currentSelectOption = picked
      return true
    },
    ...props,
  })
}

const tag = (field: MetaUiField, context: UiContext, props?: PropData) =>
  h(Tag, {
    value: context.displayField(field, props?.row),
    severity: props?.severity,
    ...props,
  })

const tags = (field: MetaUiField, context: UiContext, props?: PropData) =>
  h(
    'div',
    { class: 'mmda-prime-tags' },
    tagLabels(field, context, props).map((label) =>
      h(Tag, { value: label, ...props }),
    ),
  )

const chips = (field: MetaUiField, context: UiContext, props?: PropData) =>
  h(
    'div',
    { ...props, class: ['mmda-chips', props?.class] },
    tagLabels(field, context, props).map((label) =>
      h(Chip, { label }),
    ),
  )

const tagLabels = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
): string[] => {
  const raw = context.getFieldValue(field, props?.row)
  const labelOf = (value: any) =>
    String(
      field.reference?.labelOf?.(value) ??
        value?.label ??
        value?.text ??
        value ??
        '',
    ).trim()
  if (raw == null || raw === '') return []
  if (Array.isArray(raw)) return raw.map(labelOf).filter(Boolean)
  if (typeof raw === 'number' && field.reference?.refOptions?.length) {
    return field.reference.refOptions
      .filter((item: any) => Number(field.reference!.valueOf(item)) & raw)
      .map(labelOf)
      .filter(Boolean)
  }
  return String(raw)
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

const cellDomProps = (props?: PropData) =>
  cleanProps(TABLE_CELL_PROP_KEYS, props ?? {})

const externalLink = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => {
  const app = context.app
  if (!app) return fallbackDisplay(field, context, props)

  const model = (props?.row ?? context.model) as Record<string, any>
  const alias = field.reference?.alias
  const fldVal = model[field.fieldName] ?? (alias ? model[alias] : undefined)
  if (!fldVal) return fallbackDisplay(field, context, props)

  const fldText = MetaModel.displayField(model, field)
  const domProps = cellDomProps(props)
  if (!fldText) {
    return h(
      'span',
      { class: 'warning', name: field.fieldName, ...domProps },
      'N/A',
    )
  }

  const linkable = props?.isSearch ? false : (props?.linkable ?? true)
  const reference = field.reference
  if (!reference) {
    return h('span', { name: field.fieldName, ...domProps }, fldText)
  }

  const { modules = [], context: appContext } = app
  const systemList: any[] = appContext?.systemList ?? []
  const api = context.apiClient ?? app.api
  const isCurrentSystem =
    !reference.refDbName || reference.refDbName === api?.config.service

  const refMainModule = isCurrentSystem
    ? modules.find((module: Module) =>
        module?.subModules?.some(
          (subModule) => subModule.objName === reference.refObjName,
        ),
      )
    : systemList.find((system: any) => system.service === reference.refDbName)

  const refModule = refMainModule?.subModules?.find(
    (subModule) => subModule.objName === reference.refObjName,
  )

  const readable = isCurrentSystem
    ? Boolean(refModule?.authority?.allowRead)
    : Boolean(refMainModule?.authority?.allowRead)
  if (!linkable || !readable) {
    return h('span', { name: field.fieldName, ...domProps }, fldText)
  }

  const iconProps: PropData = {
    role: 'external-link-icon',
    style: {
      marginRight: '5px',
      cursor: 'pointer',
      color: 'var(--p-button-info-background)',
    },
    onClick: (event: Event) => {
      event.stopPropagation()
      void (async () => {
        await context.app?.syncAuthState?.()
        const url = context.routeToRelative?.(field, model)
        if (url) window.open(url, '_blank', 'noopener,noreferrer')
      })()
    },
  }

  return h(
    'div',
    {
      class: 'flex_item_center',
      role: 'mmda-external-link',
      id: field.fieldName,
      ...domProps,
    },
    [
      fasIcon(
        'external-link',
        mergeProps(iconProps, { class: iconProps.class }),
      ),
      h('span', fldText),
    ],
  )
}

const fileLink = (field: MetaUiField, context: UiContext, props?: PropData) => {
  const value = context.getFieldValue(field, props?.row)
  return h(
    'a',
    {
      href: value,
      target: '_blank',
      rel: 'noopener noreferrer',
      ...cellDomProps(props),
    },
    context.displayField(field, props?.row) || String(value ?? ''),
  )
}

const factory: UiFieldFactory = {
  fallbackDisplay,
  fallbackInput,
  textInput,
  textArea,
  password,
  dropdown,
  select: dropdown,
  multiSelect,
  numberInput,
  positiveNumberInput: (field, context, props) =>
    numberInput(field, context, { min: 0, ...props }),
  negativenumberInput: (field, context, props) =>
    numberInput(field, context, { max: 0, ...props }),
  percentInput,
  checkbox,
  switcher,
  Switcher: switcher,
  datePicker,
  dateTimePicker,
  monthPicker,
  timePicker,
  dateRangePicker: (field, context, props) =>
    control(DatePicker, field, context, props, {
      selectionMode: 'range',
      dateFormat: 'yy-mm-dd',
      showIcon: true,
    }),
  mobileInput: (field, context, props) =>
    control(InputMask, field, context, props, { mask: '999 9999 9999' }),
  zipCodeInput: (field, context, props) =>
    control(InputMask, field, context, props, { mask: '999999' }),
  slider: (field, context, props) =>
    control(Slider, field, context, props, { fluid: false }),
  colorPicker: (field, context, props) =>
    control(ColorPicker, field, context, props, { fluid: false }),
  filePicker: (field, context, props) =>
    h(FileUpload, {
      mode: 'basic',
      name: field.fieldName,
      chooseLabel: field.displayLabel,
      disabled: context.isFieldReadonly(field),
      customUpload: true,
      auto: true,
      onUploader: (event: any) =>
        context.setFieldValue(field, event.files?.[0] ?? event.files),
      ...props,
    }),
  fileUpload: (field, context, props) =>
    h(FileUpload, {
      name: field.fieldName,
      multiple: true,
      disabled: context.isFieldReadonly(field),
      customUpload: true,
      onUploader: (event: any) => context.setFieldValue(field, event.files),
      ...props,
    }),
  imagePicker: (field, context, props) =>
    h(Image, {
      src: context.getFieldValue(field, props?.row),
      preview: true,
      ...props,
    }),
  image: (field, context, props) =>
    h(Image, {
      src: context.getFieldValue(field, props?.row),
      preview: true,
      ...props,
    }),
  progressBar: (field, context, props) =>
    h(ProgressBar, {
      value: Number(context.getFieldValue(field, props?.row) ?? 0),
      ...props,
    }),
  tag,
  tags,
  chips,
  enumSetTags: tags,
  fileLink,
  externalLink,
  textSpan: fallbackDisplay,
  span: fallbackDisplay,
  multilineText: (field, context, props) =>
    h(
      'span',
      { style: { whiteSpace: 'pre-wrap' }, ...props },
      context.displayField(field, props?.row),
    ),
  percentage: (field, context, props) =>
    h(
      'span',
      props,
      `${Number(context.getFieldValue(field, props?.row) ?? 0) * 100}%`,
    ),
  amountText: fallbackDisplay,
  quantityUnit: (field, context, props) => {
    const value = context.getFieldValue(field, props?.row)
    const unit = field.suffix?.trim()
    const text =
      value == null || value === ''
        ? (field.nullDisplayText ?? '')
        : unit
          ? `${value} ${unit}`
          : String(value)
    return h('span', { ...props, class: ['mmda-quantity-unit', props?.class] }, text)
  },
  checkIcon: (field, context, props) =>
    h('i', {
      class: context.getFieldValue(field, props?.row)
        ? 'pi pi-check-circle p-text-success'
        : 'pi pi-circle',
      ...props,
    }),
  checkedIcon: (field, context, props) =>
    h('i', {
      class: context.getFieldValue(field, props?.row)
        ? 'pi pi-check-circle p-text-success'
        : 'pi pi-circle',
      ...props,
    }),
  searchInput: textInput,
  searchBox,
  comboBox: dropdown,
  autoComplete: dropdown,
  associationTable: fallbackDisplay,
  treeSelect: dropdown,
  enumSetCheckboxGroup: multiSelect,
  toHoursInput: numberInput,
  toMinutesInput: numberInput,
  toSecondsInput: numberInput,
  colorBox: (field, context, props) =>
    h('span', {
      title: String(context.getFieldValue(field, props?.row) ?? ''),
      style: {
        display: 'inline-block',
        width: '1.5rem',
        height: '1.5rem',
        backgroundColor: String(
          context.getFieldValue(field, props?.row) ?? 'transparent',
        ),
      },
      ...props,
    }),
  statusLight: tag,
}

const aliases: Record<string, string> = {
  TextBox: 'textInput',
  TextField: 'textInput',
  TextArea: 'textArea',
  AutoComplete: 'autoComplete',
  DropdownList: 'dropdown',
  Combobox: 'comboBox',
  DatePicker: 'datePicker',
  DateTimePicker: 'dateTimePicker',
  MonthPicker: 'monthPicker',
  TimePicker: 'timePicker',
  NumberInput: 'numberInput',
  ToHoursInput: 'toHoursInput',
  ToMinutesInput: 'toMinutesInput',
  ToSecondsInput: 'toSecondsInput',
  PositiveNumberInput: 'positiveNumberInput',
  NegativenumberInput: 'negativenumberInput',
  PercentInput: 'percentInput',
  SpinBox: 'numberInput',
  CheckBox: 'checkbox',
  Checkbox: 'checkbox',
  SearchBox: 'searchBox',
  AssociationTable: 'associationTable',
  CheckBoxList: 'enumSetCheckboxGroup',
  BitCheckBoxList: 'enumSetCheckboxGroup',
  Slider: 'slider',
  ColorPicker: 'colorPicker',
  FilePicker: 'filePicker',
  FileUpload: 'fileUpload',
  ImagePicker: 'imagePicker',
  PastTime: 'fallbackDisplay',
  MultilineText: 'multilineText',
  Percentage: 'percentage',
  AmountText: 'amountText',
  QuantityUnit: 'quantityUnit',
  Tag: 'tag',
  Tags: 'tags',
  Chips: 'chips',
  BitTags: 'enumSetTags',
  BitChipSet: 'enumSetTags',
  EnumChipSet: 'enumSetTags',
  CheckIcon: 'checkIcon',
  CheckedIcon: 'checkedIcon',
  HasOneText: 'externalLink',
  ColorBox: 'colorBox',
  ProgressBar: 'progressBar',
  Image: 'image',
  StatusLight: 'statusLight',
}

for (const [alias, source] of Object.entries(aliases)) {
  factory[alias] = factory[source]
}

export const primeVueFieldFactory = factory

export function createPrimeVueFieldFactory(): UiFieldFactory {
  return { ...factory }
}
