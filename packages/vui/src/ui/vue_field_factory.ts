import { h, type VNode } from 'vue'
import {
  MetaModel,
  SqlDataType,
  autoCompleteBindValue,
  autoCompletePropsFromField,
  avatarPropsFromField,
  bitCheckBoxListPropsFromField,
  bitChipSetPropsFromField,
  checkBoxListPropsFromField,
  checkBoxPropsFromField,
  chipsPropsFromField,
  colorPickerPropsFromField,
  comboBoxPropsFromField,
  datePickerPropsFromField,
  dateRangePickerPropsFromField,
  dateTimePickerPropsFromField,
  dropDownListPropsFromField,
  enumChipSetPropsFromField,
  maskedTextBoxPropsFromField,
  monthPickerPropsFromField,
  multiBitSelectPropsFromField,
  multiItemSelectPropsFromField,
  multiSelectPropsFromField,
  multiTextSelectPropsFromField,
  multiValueSelectPropsFromField,
  numberInputPropsFromField,
  oneTimePasswordPropsFromField,
  progressBarPropsFromField,
  radioButtonGroupPropsFromField,
  ratingPropsFromField,
  relativeTime as formatRelativeTime,
  routeAutoCompleteField,
  signaturePadPropsFromField,
  sliderPropsFromField,
  stepperPropsFromField,
  switchPropsFromField,
  tagAutoCompletePropsFromField,
  textAreaPropsFromField,
  textInputPropsFromField,
  timePickerPropsFromField,
  timelineSqlOf,
  treeSelectPropsFromField,
  MOBILE_MASK,
  ZIP_MASK,
  type MetaUiField,
  type Module,
  type UiContext,
  type UiFieldFactory,
  type UiFieldRenderer,
  type UiProps,
} from '@mmda/core'
import type { VuiFactory } from './factory'
import { cleanProps, TABLE_CELL_PROP_KEYS } from './field_factory'
import {
  inplaceFieldContentRenderer,
  inplaceFieldDisplayRenderer,
} from './factory/inplace_field'
import {
  renderFileLinkField,
  renderFileUploaderField,
  renderFilesUploaderField,
  renderImageUploaderField,
  renderImagesUploaderField,
} from './factory/file_upload_field'

/**
 * 表格 cell 渲染时透传的第三参。core `UiProps` 无索引签名，
 * 这里显式声明 row / 行级开关，避免皮肤各自 `as any`。
 */
export interface VuiFieldCellProps extends UiProps {
  row?: any
  isSearch?: boolean
  linkable?: boolean
  title?: string
}

/**
 * 字段渲染器。表格 cell 会额外传第 3 参（含 `row` 等 cell props），
 * 因此这里比 core `UiFieldRenderer` 多一个可选 `props`。
 */
export type VuiFieldRenderer = (
  field: MetaUiField,
  context: UiContext,
  props?: VuiFieldCellProps,
) => VNode

/** 单位：优先 metacol.suffix；否则 formatter 若为纯单位文本（天、KG）也可用作后缀。 */
export const resolveFieldUnit = (field: MetaUiField): string => {
  const suffix = field.suffix?.trim()
  if (suffix) return suffix
  const formatter = field.formatter?.trim()
  if (
    formatter &&
    formatter.length <= 12 &&
    !/[#0nNpPcCydDhHmMsSfF*?[\]]/.test(formatter)
  ) {
    return formatter
  }
  return ''
}

const cellDomProps = (props?: UiProps): UiProps =>
  cleanProps(TABLE_CELL_PROP_KEYS, props ?? {})

/**
 * Vue 字段工厂基类。
 *
 * 每个字段成员只做两件事：用 core 的 `*PropsFromField` 把 `MetaUiField`
 * 译成 `UiXxxProps`，然后交给皮肤 `factory.xxx` 渲染。因此 Vue 皮肤只需要
 * 提供 factory，不再重复写字段到控件的映射。
 */
export class VueUiFieldFactory implements UiFieldFactory<VNode> {
  [key: string]: any

  constructor(protected readonly factory: VuiFactory) {}

  protected control(field: MetaUiField, context: UiContext, node: VNode): VNode {
    const invalid = Boolean(context.isInvalid?.(field))
    return h('div', { class: ['mmda-control', invalid && 'is-invalid'] }, [
      node,
      invalid
        ? h('span', { class: 'e-error' }, context.getInvalidMessage?.(field))
        : null,
    ])
  }

  protected fieldDisplayText(
    field: MetaUiField,
    context: UiContext,
    props?: VuiFieldCellProps,
  ): string {
    const value = context.displayField(field, props?.row)
    return value == null ? '' : String(value)
  }

  searchRelative: VuiFieldRenderer = (field, context, props) =>
    this.factory.searchRelative({
      modelValue: context.getFieldValue(field, props?.row),
      toSearch: () => context.select(field),
      optionLabel: undefined,
      dataKey: field.reference?.refFlds?.[0] ?? 'value',
      placeholder: field.placeholder,
      onUpdate: (value) => context.setFieldValue(field, value),
    })

  fallbackInput: VuiFieldRenderer = (field, context) => {
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

  fallbackDisplay: VuiFieldRenderer = (field, context, props) =>
    h(
      'output',
      { class: 'mmda-display', ...props },
      this.fieldDisplayText(field, context, props),
    )

  textSpan = this.fallbackDisplay

  textInput: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.textInput(textInputPropsFromField(field, context)),
    )

  textArea: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.textArea(textAreaPropsFromField(field, context)),
    )

  password: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.textInput({
        ...textInputPropsFromField(field, context),
        type: 'Password',
      }),
    )

  numberInput: VuiFieldRenderer = (field, context) => {
    const unit = resolveFieldUnit(field)
    return this.control(
      field,
      context,
      this.factory.numberInput({
        ...numberInputPropsFromField(field, context),
        ...(unit ? { suffix: unit } : {}),
      }),
    )
  }

  percentInput: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.numberInput({
        ...numberInputPropsFromField(field, context),
        kind: 'percent',
      }),
    )

  positiveNumberInput: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.numberInput({
        ...numberInputPropsFromField(field, context),
        min: 0,
      }),
    )

  negativeNumberInput: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.numberInput({
        ...numberInputPropsFromField(field, context),
        max: 0,
      }),
    )

  maskedTextBox: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.maskedTextBox(maskedTextBoxPropsFromField(field, context)),
    )

  oneTimePasswordInput: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.oneTimePasswordInput(
        oneTimePasswordPropsFromField(field, context),
      ),
    )

  mobileInput: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.maskedTextBox(
        maskedTextBoxPropsFromField(field, context, { mask: MOBILE_MASK }),
      ),
    )

  zipCodeInput: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.maskedTextBox(
        maskedTextBoxPropsFromField(field, context, { mask: ZIP_MASK }),
      ),
    )

  datePicker: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.datePicker(datePickerPropsFromField(field, context)),
    )

  dateTimePicker: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.dateTimePicker(dateTimePickerPropsFromField(field, context)),
    )

  monthPicker: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.monthPicker(monthPickerPropsFromField(field, context)),
    )

  timePicker: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.timePicker(timePickerPropsFromField(field, context)),
    )

  dateRangePicker: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.dateRangePicker(dateRangePickerPropsFromField(field, context)),
    )

  dropDownList: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.dropDownList(dropDownListPropsFromField(field, context)),
    )

  comboBox: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.comboBox(comboBoxPropsFromField(field, context)),
    )

  autoComplete: VuiFieldRenderer = (field, context) => {
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

  tagAutoComplete: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.tagAutoComplete(tagAutoCompletePropsFromField(field, context)),
    )

  treeSelect: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.treeSelect(treeSelectPropsFromField(field, context)),
    )

  radioButtonGroup: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.radioButtonGroup(
        radioButtonGroupPropsFromField(field, context),
      ),
    )

  multiSelect: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.multiSelect(multiSelectPropsFromField(field, context)),
    )

  multiItemSelect: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.multiItemSelect(
        multiItemSelectPropsFromField(field, context),
      ),
    )

  multiValueSelect: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.multiValueSelect(
        multiValueSelectPropsFromField(field, context),
      ),
    )

  multiTextSelect: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.multiTextSelect(
        multiTextSelectPropsFromField(field, context),
      ),
    )

  multiBitSelect: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.multiBitSelect(multiBitSelectPropsFromField(field, context)),
    )

  checkBoxList: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.checkBoxList(checkBoxListPropsFromField(field, context)),
    )

  bitCheckBoxList: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.bitCheckBoxList(
        bitCheckBoxListPropsFromField(field, context),
      ),
    )

  checkBox: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.checkBox(checkBoxPropsFromField(field, context)),
    )

  switch: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.switch(switchPropsFromField(field, context)),
    )

  slider: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.slider(sliderPropsFromField(field, context)),
    )

  rating: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.rating(ratingPropsFromField(field, context)),
    )

  colorPicker: VuiFieldRenderer = (field, context) =>
    this.control(
      field,
      context,
      this.factory.colorPicker(colorPickerPropsFromField(field, context)),
    )

  quantityUnit: VuiFieldRenderer = (field, context, props) => {
    const value = context.getFieldValue(field, props?.row)
    const unit = resolveFieldUnit(field)
    const text =
      value == null || value === ''
        ? (field.nullDisplayText ?? '')
        : unit
          ? `${String(value)} ${unit}`
          : String(value)
    return h(
      'span',
      { ...props, class: ['mmda-quantity-unit', props?.class] },
      text,
    )
  }

  relativeTime: VuiFieldRenderer = (field, context, props) =>
    h('span', props, () =>
      formatRelativeTime(
        timelineSqlOf(context.getFieldValue(field, props?.row)) ?? '',
        context.locale,
      ),
    )

  percentage: VuiFieldRenderer = (field, context, props) =>
    h(
      'span',
      props,
      `${Number(context.getFieldValue(field, props?.row) ?? 0) * 100}%`,
    )

  multilineText: VuiFieldRenderer = (field, context, props) =>
    h(
      'span',
      { style: { whiteSpace: 'pre-wrap' }, ...props },
      context.displayField(field, props?.row),
    )

  amountText = this.fallbackDisplay

  fileLink: VuiFieldRenderer = (field, context) =>
    renderFileLinkField(field, context)

  externalLink: VuiFieldRenderer = (field, context, props) => {
    const app = context.app
    if (!app) return this.fallbackDisplay(field, context, props)

    const model = (props?.row ?? context.model) as Record<string, any>
    const alias = field.reference?.alias
    const fldVal = model[field.fieldName] ?? (alias ? model[alias] : undefined)
    if (!fldVal) return this.fallbackDisplay(field, context, props)

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
    const systemList: Module[] = app.state.systemList ?? []
    const api = context.logic?.apiClient ?? app.api
    const isCurrentSystem =
      !reference.refDbName || reference.refDbName === api?.config.service

    const refMainModule = isCurrentSystem
      ? modules.find((module: Module) =>
          module?.subModules?.some(
            (subModule: Module) => subModule.objName === reference.refObjName,
          ),
        )
      : systemList.find((system) => system.service === reference.refDbName)

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
        h('i', {
          role: 'external-link-icon',
          class: 'fas fa-external-link',
          style: {
            marginRight: '5px',
            cursor: 'pointer',
          },
          onClick: (event: Event) => {
            event.stopPropagation()
            void (async () => {
              await app.syncAuthState?.()
              const url = context.routeToRelative?.(field, model)
              if (url) window.open(url, '_blank', 'noopener,noreferrer')
            })()
          },
        }),
        h('span', fldText),
      ],
    )
  }

  hasOneText = this.externalLink
  HasOneText = this.externalLink

  fileUploader: VuiFieldRenderer = (field, context) =>
    renderFileUploaderField(field, context)

  filesUploader: VuiFieldRenderer = (field, context) =>
    renderFilesUploaderField(field, context)

  imageUploader: VuiFieldRenderer = (field, context) =>
    renderImageUploaderField(field, context)

  imagesUploader: VuiFieldRenderer = (field, context) =>
    renderImagesUploaderField(field, context)

  image: VuiFieldRenderer = (field, context, props) =>
    h('img', {
      src: context.getFieldValue(field, props?.row),
      ...props,
    })

  avatar: VuiFieldRenderer = (field, context) =>
    this.factory.avatar(avatarPropsFromField(field, context))

  progressBar: VuiFieldRenderer = (field, context) =>
    this.factory.progressBar(progressBarPropsFromField(field, context))

  signaturePad: VuiFieldRenderer = (field, context) =>
    this.factory.signaturePad(signaturePadPropsFromField(field, context))

  stepper: VuiFieldRenderer = (field, context) =>
    this.factory.stepper(stepperPropsFromField(field, context))

  inPlaceFieldEditor: VuiFieldRenderer = (field, context) => {
    const display = inplaceFieldDisplayRenderer(field, this)
    const content = inplaceFieldContentRenderer(field, this)
    if (context.isFieldReadonly(field)) return display(field, context)
    return this.factory.inplaceEditor(
      { disabled: false },
      {
        display: () => display(field, context),
        content: () => content(field, context),
      },
    )
  }

  chips: VuiFieldRenderer = (field, context) =>
    this.factory.chips(chipsPropsFromField(field, context))

  tags = this.chips

  enumChipSet: VuiFieldRenderer = (field, context) =>
    this.factory.chips(enumChipSetPropsFromField(field, context))

  bitChipSet: VuiFieldRenderer = (field, context) =>
    this.factory.chips(bitChipSetPropsFromField(field, context))

  colorBox: VuiFieldRenderer = (field, context, props) =>
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
    })

  checkIcon: VuiFieldRenderer = (field, context, props) =>
    this.booleanIcon(context.getFieldValue(field, props?.row), props)

  checkedIcon: VuiFieldRenderer = (field, context, props) =>
    this.booleanIcon(context.getFieldValue(field, props?.row), props)

  private booleanIcon(value: unknown, props?: UiProps): VNode {
    const checked = Boolean(value)
    return h('i', {
      ...props,
      class: [
        'mmda-bool-icon',
        checked
          ? 'fas fa-check-circle mmda-bool-icon--true'
          : 'e-icons e-circle mmda-bool-icon--false',
        props?.class,
      ],
    })
  }
}
