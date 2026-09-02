import { h, type Component, type VNode } from 'vue'
import {
  MetaModel,
  SqlDataType,
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
import {
  NCheckbox,
  NColorPicker,
  NDatePicker,
  NImage,
  NInput,
  NInputNumber,
  NProgress,
  NSelect,
  NSlider,
  NSwitch,
  NTag,
  NUpload,
} from 'naive-ui'

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
  valueKey = 'value',
) => {
  const invalid = invalidOf(field, context)
  const onUpdate = extra[`onUpdate:${valueKey}`] ?? update(field, context)
  return h('div', { class: ['mmda-agnaive-control', invalid && 'is-invalid'] }, [
    h(component, {
      id: field.fieldName,
      name: field.fieldName,
      [valueKey]: context.getFieldValue(field),
      disabled: context.isFieldReadonly(field),
      status: invalid ? 'error' : undefined,
      placeholder: field.placeholder,
      maxlength: field.maxLength,
      [`onUpdate:${valueKey}`]: onUpdate,
      ...extra,
      ...props,
    }),
    invalid &&
      h(
        'p',
        { class: 'mmda-agnaive-error' },
        (context as any).getInvalidMessage?.(field),
      ),
  ])
}

const textInput = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(NInput, field, context, props)

const textArea = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(NInput, field, context, props, { type: 'textarea', rows: 3 })

const password = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(NInput, field, context, props, {
    type: 'password',
    showPasswordOn: 'click',
  })

const dropdown = (field: MetaUiField, context: UiContext, props?: PropData) => {
  const reference = field.reference
  if (!reference) {
    return control(NSelect, field, context, props, {
      options: props?.options ?? [],
      filterable: true,
      clearable: field.nullable,
    })
  }
  const options = (reference.refOptions ?? props?.options ?? []).map(
    (option: any) => ({
      label: reference.labelOf(option),
      value: reference.valueOf(option),
    }),
  )
  return control(NSelect, field, context, props, {
    options,
    filterable: true,
    clearable: field.nullable,
  })
}

const multiSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => {
  const reference = field.reference
  const options = reference
    ? (reference.refOptions ?? []).map((option: any) => ({
        label: reference.labelOf(option),
        value: reference.valueOf(option),
      }))
    : (props?.options ?? [])
  return control(NSelect, field, context, props, {
    options,
    multiple: true,
    filterable: true,
  })
}

const numberInput = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(NInputNumber, field, context, props, {
    showButton: false,
    precision: (field as any).scale,
  })

const percentInput = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => control(NInputNumber, field, context, props, { min: 0, max: 100 })

const checkbox = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(NCheckbox, field, context, props, {}, 'checked')

const switcher = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(NSwitch, field, context, props)

const datePicker = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(NDatePicker, field, context, props, { type: 'date' })

const dateTimePicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => control(NDatePicker, field, context, props, { type: 'datetime' })

const monthPicker = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(NDatePicker, field, context, props, { type: 'month' })

const timePicker = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(NDatePicker, field, context, props, { type: 'time' })

const fallbackDisplay = (
  field: MetaUiField,
  context: UiContext,
  props: PropData = {},
) =>
  h(
    'output',
    { class: 'mmda-agnaive-display', ...props },
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
  const searchOptions = context.getSearchForRelativeOptions(field)
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
    searchOptions.searchWord = fieldValue
  }
  return builder.buildSearchForRelative(context, field, {
    modelValue: searchOptions.searchWord ?? fieldValue,
    showClear: Boolean(searchOptions.searchWord ?? fieldValue),
    options: fldOptions.selectOptions,
    title: props?.title ?? field.displayLabel,
    dataKey: valueKey,
    optionLabel:
      reference.refFlds.length > 2
        ? (data: any) => reference.labelOf(data)
        : labelKey,
    invalid: invalidOf(field, context),
    onChange: (value: any) => {
      searchOptions.searchWord = value || null
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
      if (searchOptions.isComposing) return
      void context.searchRelative(field, value)
    },
    toSearch: async () => {
      const picked = await (context as any).pickRelative?.(field)
      if (picked) searchOptions.searchWord = picked
      return true
    },
    ...props,
  })
}

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
    .map(item => item.trim())
    .filter(Boolean)
}

const tag = (field: MetaUiField, context: UiContext, props?: PropData) =>
  h(NTag, { ...props }, { default: () => context.displayField(field, props?.row) })

const tags = (field: MetaUiField, context: UiContext, props?: PropData) =>
  h(
    'div',
    { class: 'mmda-agnaive-tags' },
    tagLabels(field, context, props).map(label =>
      h(NTag, { ...props }, { default: () => label }),
    ),
  )

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
    return h('span', { class: 'warning', name: field.fieldName, ...domProps }, 'N/A')
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
          (subModule: Module) => subModule.objName === reference.refObjName,
        ),
      )
    : systemList.find((system: any) => system.service === reference.refDbName)
  const refModule = refMainModule?.subModules?.find(
    (subModule: Module) => subModule.objName === reference.refObjName,
  )
  const readable = isCurrentSystem
    ? Boolean(refModule?.authority?.allowRead)
    : Boolean(refMainModule?.authority?.allowRead)
  if (!linkable || !readable) {
    return h('span', { name: field.fieldName, ...domProps }, fldText)
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
      fasIcon('external-link', {
        style: { marginRight: '5px', cursor: 'pointer' },
        onClick: (event: Event) => {
          event.stopPropagation()
          void (async () => {
            await context.app?.syncAuthState?.()
            const url = context.routeToRelative?.(field, model)
            if (url) window.open(url, '_blank', 'noopener,noreferrer')
          })()
        },
      }),
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
    control(NDatePicker, field, context, props, { type: 'daterange' }),
  mobileInput: textInput,
  zipCodeInput: textInput,
  slider: (field, context, props) => control(NSlider, field, context, props),
  colorPicker: (field, context, props) =>
    control(NColorPicker, field, context, props),
  filePicker: (field, context, props) =>
    h(NUpload, {
      disabled: context.isFieldReadonly(field),
      defaultUpload: false,
      onChange: (event: any) =>
        context.setFieldValue(field, event.fileList?.[0]?.file ?? event.file?.file),
      ...props,
    }),
  fileUpload: (field, context, props) =>
    h(NUpload, {
      multiple: true,
      disabled: context.isFieldReadonly(field),
      defaultUpload: false,
      onChange: (event: any) =>
        context.setFieldValue(
          field,
          event.fileList?.map((item: any) => item.file),
        ),
      ...props,
    }),
  imagePicker: (field, context, props) =>
    h(NImage, { src: context.getFieldValue(field, props?.row), ...props }),
  image: (field, context, props) =>
    h(NImage, { src: context.getFieldValue(field, props?.row), ...props }),
  progressBar: (field, context, props) =>
    h(NProgress, {
      type: 'line',
      percentage: Number(context.getFieldValue(field, props?.row) ?? 0),
      ...props,
    }),
  tag,
  tags,
  chips: tags,
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
        ? 'fas fa-check'
        : 'fas fa-times',
      ...props,
    }),
  checkedIcon: (field, context, props) =>
    h('i', {
      class: context.getFieldValue(field, props?.row)
        ? 'fas fa-check-circle'
        : 'far fa-circle',
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

export function createAgNaiveFieldFactory(): UiFieldFactory {
  return { ...factory }
}
