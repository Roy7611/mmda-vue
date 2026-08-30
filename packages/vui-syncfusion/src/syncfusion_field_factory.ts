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
import { CheckBoxComponent, SwitchComponent } from '@syncfusion/ej2-vue-buttons'
import {
  DatePickerComponent,
  DateTimePickerComponent,
  TimePickerComponent,
} from '@syncfusion/ej2-vue-calendars'
import {
  DropDownListComponent,
  MultiSelectComponent,
} from '@syncfusion/ej2-vue-dropdowns'
import {
  ColorPickerComponent,
  MaskedTextBoxComponent,
  NumericTextBoxComponent,
  SliderComponent,
  TextAreaComponent,
  TextBoxComponent,
  UploaderComponent,
} from '@syncfusion/ej2-vue-inputs'
import { ProgressBarComponent } from '@syncfusion/ej2-vue-progressbar'
import { getSyncfusionCulture } from './syncfusion_i18n'

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
  const onChange = (args: any) => {
    const value = args?.value ?? args?.checked ?? args
    update(field, context)(value)
  }
  return h('div', { class: ['mmda-sf-control', invalid && 'is-invalid'] }, [
    h(component, {
      id: field.fieldName,
      name: field.fieldName,
      value: context.getFieldValue(field),
      enabled: !context.isFieldReadonly(field),
      readonly: context.isFieldReadonly(field),
      placeholder: field.placeholder,
      locale: getSyncfusionCulture(),
      cssClass: invalid ? 'e-error' : undefined,
      ...extra,
      ...props,
      change: props.change ?? onChange,
      input: props.input ?? onChange,
    }),
    invalid &&
      h(
        'span',
        { class: 'e-error' },
        (context as any).getInvalidMessage?.(field),
      ),
  ])
}

const textInput = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(TextBoxComponent as any, field, context, props)

const textArea = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(TextAreaComponent as any, field, context, props, { rows: 3 })

const password = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(TextBoxComponent as any, field, context, props, { type: 'password' })

const dropdown = (field: MetaUiField, context: UiContext, props?: PropData) => {
  const reference = field.reference
  return control(DropDownListComponent as any, field, context, props, {
    dataSource: reference?.refOptions ?? props?.options ?? [],
    fields: reference
      ? {
          text: 'label',
          value: 'value',
        }
      : props?.fields,
    allowFiltering: true,
    showClearButton: field.nullable,
  })
}

const multiSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) => {
  const reference = field.reference
  return control(MultiSelectComponent as any, field, context, props, {
    dataSource: reference?.refOptions ?? props?.options ?? [],
    mode: 'CheckBox',
  })
}

const numberInput = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(NumericTextBoxComponent as any, field, context, props, {
    format: 'n',
    decimals: (field as any).scale,
  })

const percentInput = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(NumericTextBoxComponent as any, field, context, props, {
    format: 'p',
    min: 0,
    max: 1,
  })

const checkbox = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(CheckBoxComponent as any, field, context, props, {
    checked: context.getFieldValue(field),
    label: field.displayLabel,
  })

const switcher = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(SwitchComponent as any, field, context, props, {
    checked: context.getFieldValue(field),
  })

const datePicker = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(DatePickerComponent as any, field, context, props, {
    format: 'yyyy-MM-dd',
  })

const dateTimePicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(DateTimePickerComponent as any, field, context, props, {
    format: 'yyyy-MM-dd HH:mm:ss',
  })

const monthPicker = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(DatePickerComponent as any, field, context, props, {
    start: 'Year',
    depth: 'Year',
    format: 'yyyy-MM',
  })

const timePicker = (field: MetaUiField, context: UiContext, props?: PropData) =>
  control(TimePickerComponent as any, field, context, props, {
    format: 'HH:mm:ss',
  })

const fallbackDisplay = (
  field: MetaUiField,
  context: UiContext,
  props: PropData = {},
) =>
  h(
    'output',
    { class: 'mmda-sf-display', ...props },
    String(context.displayField(field, props.row) ?? ''),
  )

const fallbackInput = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
): VNode => {
  if (field.reference?.refOptions?.length)
    return dropdown(field, context, props)
  if (SqlDataType.isBool(field.dataType)) return checkbox(field, context, props)
  if (SqlDataType.isNum(field.dataType))
    return numberInput(field, context, props)
  if (SqlDataType.isDate(field.dataType))
    return datePicker(field, context, props)
  return textInput(field, context, props)
}

const tag = (field: MetaUiField, context: UiContext, props?: PropData) =>
  h('span', { class: 'e-badge', ...props }, context.displayField(field, props?.row))

const tags = (field: MetaUiField, context: UiContext, props?: PropData) =>
  h(
    'div',
    { class: 'mmda-sf-tags' },
    (context.getFieldValue(field, props?.row) ?? []).map((value: any) =>
      h(
        'span',
        { class: 'e-badge', ...props },
        String(field.reference?.labelOf(value) ?? value),
      ),
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

  const iconProps: PropData = {
    role: 'external-link-icon',
    style: {
      marginRight: '5px',
      cursor: 'pointer',
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
    control(DatePickerComponent as any, field, context, props),
  mobileInput: (field, context, props) =>
    control(MaskedTextBoxComponent as any, field, context, props, {
      mask: '000 0000 0000',
    }),
  zipCodeInput: (field, context, props) =>
    control(MaskedTextBoxComponent as any, field, context, props, {
      mask: '000000',
    }),
  slider: (field, context, props) =>
    control(SliderComponent as any, field, context, props),
  colorPicker: (field, context, props) =>
    control(ColorPickerComponent as any, field, context, props),
  filePicker: (field, context, props) =>
    h(UploaderComponent as any, {
      autoUpload: true,
      enabled: !context.isFieldReadonly(field),
      selected: (event: any) =>
        context.setFieldValue(field, event.filesData?.[0] ?? event.filesData),
      ...props,
    }),
  fileUpload: (field, context, props) =>
    h(UploaderComponent as any, {
      multiple: true,
      enabled: !context.isFieldReadonly(field),
      selected: (event: any) => context.setFieldValue(field, event.filesData),
      ...props,
    }),
  imagePicker: (field, context, props) =>
    h('img', {
      src: context.getFieldValue(field, props?.row),
      ...props,
    }),
  image: (field, context, props) =>
    h('img', {
      src: context.getFieldValue(field, props?.row),
      ...props,
    }),
  progressBar: (field, context, props) =>
    h(ProgressBarComponent as any, {
      value: Number(context.getFieldValue(field, props?.row) ?? 0),
      ...props,
    }),
  tag,
  tags,
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
  checkIcon: (field, context, props) =>
    h('i', {
      class: context.getFieldValue(field, props?.row)
        ? 'e-icons e-check'
        : 'e-icons e-close',
      ...props,
    }),
  checkedIcon: (field, context, props) =>
    h('i', {
      class: context.getFieldValue(field, props?.row)
        ? 'e-icons e-circle-check'
        : 'e-icons e-circle',
      ...props,
    }),
  searchInput: textInput,
  searchBox: textInput,
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
  Tag: 'tag',
  Tags: 'tags',
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

export const syncfusionFieldFactory = factory

export function createSyncfusionFieldFactory(): UiFieldFactory {
  return { ...factory }
}
