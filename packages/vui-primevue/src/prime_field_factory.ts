import { h, mergeProps, type Component, type VNode } from 'vue'
import { SqlDataType, MetaModel, type MetaUiField, type Module, autoCompleteBindValue, autoCompletePropsFromField, checkBoxPropsFromField, switchPropsFromField, numberInputPropsFromField, textAreaPropsFromField, textInputPropsFromField, progressBarPropsFromField, signaturePadPropsFromField, stepperPropsFromField, datePickerPropsFromField, dateRangePickerPropsFromField, dateTimePickerPropsFromField, monthPickerPropsFromField, timePickerPropsFromField, comboBoxPropsFromField, dropDownListPropsFromField, radioButtonGroupPropsFromField, multiSelectPropsFromField, multiItemSelectPropsFromField, multiValueSelectPropsFromField, multiTextSelectPropsFromField, multiBitSelectPropsFromField, checkBoxListPropsFromField, bitCheckBoxListPropsFromField, tagAutoCompletePropsFromField, routeAutoCompleteField } from '@mmda/core'
import { colorPickerPropsFromField, maskedTextBoxPropsFromField, timelinePropsFromField, timelineSqlOf, relativeTime as relativeTimeView, oneTimePasswordPropsFromField, sliderPropsFromField, ratingPropsFromField, MOBILE_MASK, ZIP_MASK, treeSelectPropsFromField, chipsPropsFromField, bitChipSetPropsFromField, enumChipSetPropsFromField, cleanProps, fasIcon, TABLE_CELL_PROP_KEYS, type UiProps, type UiFieldFactory, type UiViewContext } from '@mmda/vui'
import { createAutoComplete } from './factory/autocomplete'
import { createCheckBox } from './factory/checkbox'
import { createSwitch } from './factory/switch'
import { createColorPicker } from './factory/color_picker'
import { createMaskedTextBox } from './factory/masked_text_box'
import { createOneTimePasswordInput } from './factory/one_time_password_input'
import { createSlider } from './factory/slider'
import { createRating } from './factory/rating'
import { createNumberInput } from './factory/number_input'
import { createTextArea } from './factory/text_area'
import { createTextInput } from './factory/text_input'
import { createProgressBar } from './factory/progress_bar'
import { createSignaturePad } from './factory/signature_pad'
import { createStepper } from './factory/stepper'
import { createTimeline } from './factory/timeline'
import { createDatePicker } from './factory/date_picker'
import { createDateTimePicker } from './factory/date_time_picker'
import { createTimePicker } from './factory/time_picker'
import { createDateRangePicker } from './factory/date_range_picker'
import { createComboBox } from './factory/combo_box'
import { createDropDownList } from './factory/drop_down_list'
import { createRadioButtonGroup } from './factory/radio_button_group'
import {
  createMultiBitSelect,
  createMultiItemSelect,
  createMultiSelect,
  createMultiTextSelect,
  createMultiValueSelect,
} from './factory/multi_select'
import { createBitCheckBoxList, createCheckBoxList } from './factory/check_box_list'
import { createTagAutoComplete } from './factory/tag_auto_complete'
import { createTreeSelect } from './factory/tree_select'
import { createChips } from './factory/chips'
import { renderFileLinkField, renderFileUploaderField, renderFilesUploaderField, renderImageUploaderField, renderImagesUploaderField, renderInplaceFieldEditor } from '@mmda/vui'
import Image from 'primevue/image'
import Message from 'primevue/message'
import Password from 'primevue/password'
import Tag from 'primevue/tag'

type UiContext = UiViewContext<any>

const update = (field: MetaUiField, context: UiContext) => (value: any) =>
  context.setFieldValue(field, value)

const invalidOf = (field: MetaUiField, context: UiContext) =>
  Boolean((context as any).isInvalid?.(field))

const control = (
  component: Component,
  field: MetaUiField,
  context: UiContext,
  props: UiProps = {},
  extra: UiProps = {},
) => {
  const invalid = invalidOf(field, context)
  return h('div', { class: ['mmda-control', invalid && 'is-invalid'] }, [
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

const textInput = (field: MetaUiField, context: UiContext, props?: UiProps) =>
  wrapChrome(
    field,
    context,
    createTextInput(textInputPropsFromField(field, context, props ?? {})),
  )

const textArea = (field: MetaUiField, context: UiContext, props?: UiProps) =>
  wrapChrome(
    field,
    context,
    createTextArea(
      textAreaPropsFromField(field, context, {
        rows: 3,
        resizeMode: 'Vertical',
        autoResize: true,
        ...props,
      }),
    ),
  )

const password = (field: MetaUiField, context: UiContext, props?: UiProps) =>
  control(Password, field, context, props, {
    feedback: true,
    toggleMask: true,
  })

const dropDownList = (field: MetaUiField, context: UiContext, props?: UiProps) => {
  const invalid = invalidOf(field, context)
  return h('div', { class: ['mmda-control', invalid && 'is-invalid'] }, [
    createDropDownList(dropDownListPropsFromField(field, context, props ?? {})),
    invalid &&
      h(Message, { severity: 'error', size: 'small', variant: 'simple' }, () =>
        (context as any).getInvalidMessage?.(field),
      ),
  ])
}

const radioButtonGroup = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => {
  const invalid = invalidOf(field, context)
  return h('div', { class: ['mmda-control', invalid && 'is-invalid'] }, [
    createRadioButtonGroup(
      radioButtonGroupPropsFromField(field, context, props ?? {}),
    ),
    invalid &&
      h(Message, { severity: 'error', size: 'small', variant: 'simple' }, () =>
        (context as any).getInvalidMessage?.(field),
      ),
  ])
}

const treeSelect = (field: MetaUiField, context: UiContext, props?: UiProps) => {
  const invalid = invalidOf(field, context)
  return h('div', { class: ['mmda-control', invalid && 'is-invalid'] }, [
    createTreeSelect(treeSelectPropsFromField(field, context, props ?? {})),
    invalid &&
      h(Message, { severity: 'error', size: 'small', variant: 'simple' }, () =>
        (context as any).getInvalidMessage?.(field),
      ),
  ])
}

const comboBox = (field: MetaUiField, context: UiContext, props?: UiProps) => {
  const invalid = invalidOf(field, context)
  return h('div', { class: ['mmda-control', invalid && 'is-invalid'] }, [
    createComboBox(comboBoxPropsFromField(field, context, props ?? {})),
    invalid &&
      h(Message, { severity: 'error', size: 'small', variant: 'simple' }, () =>
        (context as any).getInvalidMessage?.(field),
      ),
  ])
}

const multiSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createMultiSelect(
      multiSelectPropsFromField(field, context as any, props ?? {}),
    ),
  )

const multiItemSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createMultiItemSelect(
      multiItemSelectPropsFromField(field, context as any, props ?? {}),
    ),
  )

const multiValueSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createMultiValueSelect(
      multiValueSelectPropsFromField(field, context as any, props ?? {}),
    ),
  )

const multiTextSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createMultiTextSelect(
      multiTextSelectPropsFromField(field, context as any, props ?? {}),
    ),
  )

const multiBitSelect = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createMultiBitSelect(
      multiBitSelectPropsFromField(field, context as any, props ?? {}),
    ),
  )

const checkBoxList = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createCheckBoxList(
      checkBoxListPropsFromField(field, context as any, props ?? {}),
    ),
  )

const bitCheckBoxListField = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createBitCheckBoxList(
      bitCheckBoxListPropsFromField(field, context as any, props ?? {}),
    ),
  )

const tagAutoComplete = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) => {
  return wrapChrome(
    field,
    context,
    createTagAutoComplete(tagAutoCompletePropsFromField(
      field,
      context as any,
      props ?? {},
    )),
  )
}

const numberInput = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createNumberInput(
      numberInputPropsFromField(field, context, props ?? {}),
    ),
  )

const percentInput = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createNumberInput(
      numberInputPropsFromField(field, context, {
        kind: 'percent',
        min: 0,
        max: 100,
        ...props,
      }),
    ),
  )

const checkbox = (field: MetaUiField, context: UiContext, props?: UiProps) => {
  const invalid = invalidOf(field, context)
  return h('div', { class: ['mmda-control', invalid && 'is-invalid'] }, [
    createCheckBox(checkBoxPropsFromField(field, context, props ?? {})),
    invalid &&
      h(Message, { severity: 'error', size: 'small', variant: 'simple' }, () =>
        (context as any).getInvalidMessage?.(field),
      ),
  ])
}

const switchControl = (field: MetaUiField, context: UiContext, props?: UiProps) => {
  const invalid = invalidOf(field, context)
  return h('div', { class: ['mmda-control', invalid && 'is-invalid'] }, [
    createSwitch(switchPropsFromField(field, context, props ?? {})),
    invalid &&
      h(Message, { severity: 'error', size: 'small', variant: 'simple' }, () =>
        (context as any).getInvalidMessage?.(field),
      ),
  ])
}

function wrapChrome(
  field: MetaUiField,
  context: UiContext,
  child: VNode,
) {
  const invalid = invalidOf(field, context)
  return h('div', { class: ['mmda-control', invalid && 'is-invalid'] }, [
    child,
    invalid &&
      h(Message, { severity: 'error', size: 'small', variant: 'simple' }, () =>
        (context as any).getInvalidMessage?.(field),
      ),
  ])
}

const datePicker = (field: MetaUiField, context: UiContext, props?: UiProps) =>
  wrapChrome(
    field,
    context,
    createDatePicker(datePickerPropsFromField(field, context, props ?? {})),
  )

const dateTimePicker = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createDateTimePicker(
      dateTimePickerPropsFromField(field, context, props ?? {}),
    ),
  )

const monthPicker = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
) =>
  wrapChrome(
    field,
    context,
    createDatePicker(monthPickerPropsFromField(field, context, props ?? {})),
  )

const timePicker = (field: MetaUiField, context: UiContext, props?: UiProps) =>
  wrapChrome(
    field,
    context,
    createTimePicker(timePickerPropsFromField(field, context, props ?? {})),
  )

const fallbackDisplay = (
  field: MetaUiField,
  context: UiContext,
  props: UiProps = {},
) =>
  h(
    'output',
    { class: 'mmda-display', ...props },
    String(context.displayField(field, props.row) ?? ''),
  )

const fallbackInput = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
): VNode => {
  if (
    field.reference &&
    (field.reference.hasOne ||
      (field.reference.isRef && field.reference.refRepository))
  ) {
    return searchBox(field, context, props)
  }
  if (field.reference?.refOptions?.length)
    return dropDownList(field, context, props)
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
  props?: UiProps,
): VNode => {
  const reference = field.reference
  if (!reference) {
    return h('span', { class: 'warning' }, '不是引用字段')
  }
  const builder = context.app?.ui
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
      const picked = await (context as any).select(field)
      if (picked) fldOptions.currentSelectOption = picked
      return true
    },
    ...props,
  })
}

const autoComplete = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
): VNode => {
  const route = routeAutoCompleteField(field)
  if (route === 'dropDownList') return dropDownList(field, context, props)
  if (route === 'searchBox') return searchBox(field, context, props)
  const invalid = invalidOf(field, context)
  const reference = field.reference?.isRef ? field.reference : undefined
  return h('div', { class: ['mmda-control', invalid && 'is-invalid'] }, [
    createAutoComplete({
      value: autoCompleteBindValue(context.getFieldValue(field), { reference }),
      ...autoCompletePropsFromField(field, props ?? {}),
      disabled: context.isFieldReadonly(field),
      onUpdate: update(field, context),
    }),
    invalid &&
      h(Message, { severity: 'error', size: 'small', variant: 'simple' }, () =>
        (context as any).getInvalidMessage?.(field),
      ),
  ])
}

const tag = (field: MetaUiField, context: UiContext, props?: UiProps) =>
  h(Tag, {
    value: context.displayField(field, props?.row),
    severity: props?.severity,
    ...props,
  })

const tags = (field: MetaUiField, context: UiContext, props?: UiProps) =>
  createChips(chipsPropsFromField(field, context, props ?? {}))

const chips = tags

const bitChipSet = (field: MetaUiField, context: UiContext, props?: UiProps) =>
  createChips(bitChipSetPropsFromField(field, context, props ?? {}))

const enumChipSet = (field: MetaUiField, context: UiContext, props?: UiProps) =>
  createChips(enumChipSetPropsFromField(field, context, props ?? {}))

const cellDomProps = (props?: UiProps) =>
  cleanProps(TABLE_CELL_PROP_KEYS, props ?? {})

const externalLink = (
  field: MetaUiField,
  context: UiContext,
  props?: UiProps,
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

  const { modules = [] } = app
  const systemList: any[] = app.state.systemList ?? []
  const api = context.logic?.apiClient ?? app.api
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

  const iconProps: UiProps = {
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

const factory: UiFieldFactory = {
  fallbackDisplay,
  fallbackInput,
  textInput,
  textArea,
  password,
  dropDownList,
  select: dropDownList,
  radioButtonGroup,
  multiSelect,
  multiItemSelect,
  multiValueSelect,
  multiTextSelect,
  multiBitSelect,
  checkBoxList,
  bitCheckBoxList: bitCheckBoxListField,
  numberInput,
  positiveNumberInput: (field, context, props) =>
    numberInput(field, context, { min: 0, ...props }),
  negativenumberInput: (field, context, props) =>
    numberInput(field, context, { max: 0, ...props }),
  percentInput,
  checkBox: checkbox,
  switch: switchControl,
  Switcher: switchControl,
  switcher: switchControl,
  datePicker,
  dateTimePicker,
  monthPicker,
  timePicker,
  dateRangePicker: (field, context, props) =>
    wrapChrome(
      field,
      context,
      createDateRangePicker(
        dateRangePickerPropsFromField(field, context, props ?? {}),
      ),
    ),
  maskedTextBox: (field, context, props) =>
    wrapChrome(
      field,
      context,
      createMaskedTextBox(
        maskedTextBoxPropsFromField(field, context, props ?? {}),
      ),
    ),
  oneTimePasswordInput: (field, context, props) =>
    wrapChrome(
      field,
      context,
      createOneTimePasswordInput(
        oneTimePasswordPropsFromField(field, context, props ?? {}),
      ),
    ),
  mobileInput: (field, context, props) =>
    wrapChrome(
      field,
      context,
      createMaskedTextBox(
        maskedTextBoxPropsFromField(field, context, {
          ...props,
          mask: MOBILE_MASK,
        }),
      ),
    ),
  zipCodeInput: (field, context, props) =>
    wrapChrome(
      field,
      context,
      createMaskedTextBox(
        maskedTextBoxPropsFromField(field, context, {
          ...props,
          mask: ZIP_MASK,
        }),
      ),
    ),
  slider: (field, context, props) =>
    wrapChrome(
      field,
      context,
      createSlider(sliderPropsFromField(field, context, props ?? {})),
    ),
  rating: (field, context, props) =>
    wrapChrome(
      field,
      context,
      createRating(ratingPropsFromField(field, context, props ?? {})),
    ),
  colorPicker: (field, context, props) => {
    const invalid = invalidOf(field, context)
    return h('div', { class: ['mmda-control', invalid && 'is-invalid'] }, [
      createColorPicker(colorPickerPropsFromField(field, context, props ?? {})),
      invalid &&
        h(Message, { severity: 'error', size: 'small', variant: 'simple' }, () =>
          (context as any).getInvalidMessage?.(field),
        ),
    ])
  },
  filePicker: (field, context, props) =>
    renderFileUploaderField(field, context as any, props ?? {}),
  fileUpload: (field, context, props) =>
    renderFilesUploaderField(field, context as any, props ?? {}),
  fileUploader: (field, context, props) =>
    renderFileUploaderField(field, context as any, props ?? {}),
  filesUploader: (field, context, props) =>
    renderFilesUploaderField(field, context as any, props ?? {}),
  imagePicker: (field, context, props) =>
    renderImageUploaderField(field, context as any, props ?? {}),
  imageUploader: (field, context, props) =>
    renderImageUploaderField(field, context as any, props ?? {}),
  imagesUploader: (field, context, props) =>
    renderImagesUploaderField(field, context as any, props ?? {}),
  image: (field, context, props) =>
    h(Image, {
      src: context.getFieldValue(field, props?.row),
      preview: true,
      ...props,
    }),
  progressBar: (field, context, props) =>
    createProgressBar(progressBarPropsFromField(field, context, props ?? {})),
  signaturePad: (field, context, props) =>
    wrapChrome(
      field,
      context,
      createSignaturePad(signaturePadPropsFromField(field, context, props ?? {})),
    ),
  stepper: (field, context, props) =>
    wrapChrome(
      field,
      context,
      createStepper(stepperPropsFromField(field, context, props ?? {})),
    ),
  timeline: (field, context, props) =>
    wrapChrome(
      field,
      context,
      ((context as any).uiBuilder?.factory?.timeline ?? createTimeline)(
        timelinePropsFromField(field, context, props ?? {}),
      ),
    ),
  relativeTime: (field, context, props) =>
    relativeTimeView(timelineSqlOf(context.getFieldValue(field, props?.row)) ?? '', {
      locale: (context as any).locale,
    }),
  tag,
  tags,
  chips,
  bitChipSet,
  enumChipSet,
  fileLink: (field, context, props) =>
    renderFileLinkField(field, context as any, props ?? {}),
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
  comboBox,
  autoComplete,
  tagAutoComplete,
  treeSelect,
  enumSetCheckboxGroup: multiBitSelect,
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

factory.inplaceFieldEditor = (field, context, props) =>
  renderInplaceFieldEditor(field, context as any, props ?? {}, factory)

const aliases: Record<string, string> = {
  TextBox: 'textInput',
  TextField: 'textInput',
  TextArea: 'textArea',
  AutoComplete: 'autoComplete',
  TagAutoComplete: 'tagAutoComplete',
  DropDownList: 'dropDownList',
  RadioButtonGroup: 'radioButtonGroup',
  Combobox: 'comboBox',
  DatePicker: 'datePicker',
  DateTimePicker: 'dateTimePicker',
  MonthPicker: 'monthPicker',
  TimePicker: 'timePicker',
  DateRangePicker: 'dateRangePicker',
  NumberInput: 'numberInput',
  ToHoursInput: 'toHoursInput',
  ToMinutesInput: 'toMinutesInput',
  ToSecondsInput: 'toSecondsInput',
  PositiveNumberInput: 'positiveNumberInput',
  NegativenumberInput: 'negativenumberInput',
  PercentInput: 'percentInput',
  SpinBox: 'numberInput',
  CheckBox: 'checkBox',
  Checkbox: 'checkBox',
  checkbox: 'checkBox',
  Switch: 'switch',
  Switcher: 'switch',
  SearchBox: 'searchBox',
  CheckBoxList: 'checkBoxList',
  BitCheckBoxList: 'bitCheckBoxList',
  MultiSelect: 'multiSelect',
  MultiItemSelect: 'multiItemSelect',
  MultiValueSelect: 'multiValueSelect',
  MultiTextSelect: 'multiTextSelect',
  MultiBitSelect: 'multiBitSelect',
  Slider: 'slider',
  Rating: 'rating',
  ColorPicker: 'colorPicker',
  FilePicker: 'filePicker',
  FileUpload: 'fileUpload',
  FileUploader: 'fileUploader',
  FilesUploader: 'filesUploader',
  ImagePicker: 'imagePicker',
  ImageUploader: 'imageUploader',
  ImagesUploader: 'imagesUploader',
  FileLink: 'fileLink',
  Url: 'fileLink',
  InplaceFieldEditor: 'inplaceFieldEditor',
  MultilineText: 'multilineText',
  Percentage: 'percentage',
  AmountText: 'amountText',
  QuantityUnit: 'quantityUnit',
  Tag: 'tag',
  Tags: 'tags',
  Chips: 'chips',
  BitChipSet: 'bitChipSet',
  EnumChipSet: 'enumChipSet',
  CheckIcon: 'checkIcon',
  CheckedIcon: 'checkedIcon',
  HasOneText: 'externalLink',
  hasOneText: 'externalLink',
  ColorBox: 'colorBox',
  ProgressBar: 'progressBar',
  SignaturePad: 'signaturePad',
  Stepper: 'stepper',
  Timeline: 'timeline',
  RelativeTime: 'relativeTime',
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
