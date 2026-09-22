import { h, type VNode } from 'vue'
import {
  MetaModel,
  AbstractUiFieldFactory,
  relativeTime as formatRelativeTime,
  numberInputPropsFromField,
  signaturePadPropsFromField,
  stepperPropsFromField,
  timelineSqlOf,
  type MetaUiField,
  type Module,
  type UiContext,
  type UiFieldFactory,
  type UiProps,
} from '@mmda/core'
import type { VuiFactory } from './factory'
import { cleanProps, TABLE_CELL_PROP_KEYS } from './field_factory'
import type { VuiContext } from '../contexts/vue_ui_context'
import type { SearchForRelativeProps } from './factory/filter'
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

/**
 * 皮肤 `createSearchRelative` 组件的入参：字段工厂对账后的选择态与回写回调。
 * 皮肤组件负责把它渲染成厂商 Select / ComboBox。
 */
export interface VuiSearchRelativeProps extends SearchForRelativeProps {
  showClear?: boolean
  invalid?: boolean
  onChange?: (value: unknown) => void
  title?: string
}

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
 * Vue 字段工厂。输入控件映射表在 core {@link AbstractUiFieldFactory}；
 * 这里只实现 `control` 的 `h` 版本与框架专属的只读展示 / 上传 / 外部链接。
 */
export abstract class VueUiFieldFactory
  extends AbstractUiFieldFactory<VNode, VuiFactory>
  implements UiFieldFactory<VNode>
{
  constructor(factory: VuiFactory) {
    super(factory)
  }

  protected control(field: MetaUiField, context: UiContext, node: VNode): VNode {
    const invalid = Boolean(context.isInvalid?.(field))
    return h('div', { class: ['mmda-control', invalid && 'is-invalid'] }, [
      node,
      invalid
        ? h('span', { class: 'e-error' }, context.getInvalidMessage?.(field))
        : null,
    ])
  }

  /**
   * HAS_ONE / 远程 REF 的可编辑联想控件。
   *
   * 选项对账（当前值不在选项里时补一条）、clear 时清 refProps / alias 的统一逻辑在此；
   * 皮肤只需实现 {@link createSearchRelative} 绑定厂商 Select / ComboBox。
   */
  searchRelative: VuiFieldRenderer = (field, context, props) => {
    const reference = field.reference
    if (!reference) {
      return h('span', { class: 'warning' }, '不是引用字段')
    }

    const valueKey = reference.refFlds?.[0] ?? 'value'
    const labelKey = reference.refFlds?.[1] ?? valueKey
    const fldOptions = context.getFieldSearchOptions(field)
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
        !fldOptions.selectOptions.some((item) => reference.valueOf(item) === key)
      ) {
        fldOptions.selectOptions.unshift(fieldValue)
      }
      fldOptions.currentSelectOption = fieldValue
    }

    return this.createSearchRelative(field, context as VuiContext<any>, {
      ...props,
      modelValue: fldOptions.currentSelectOption ?? fieldValue,
      showClear: Boolean(fldOptions.currentSelectOption ?? fieldValue),
      options: fldOptions.selectOptions,
      title: props?.title ?? field.displayLabel,
      dataKey: valueKey,
      optionLabel:
        reference.refFlds.length > 2
          ? (data: any) => reference.labelOf(data)
          : labelKey,
      invalid: Boolean(context.isInvalid?.(field)),
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
        const picked = await context.select(field)
        if (picked) fldOptions.currentSelectOption = picked
        return true
      },
    })
  }

  searchBox = this.searchRelative

  /** 皮肤专属：把 {@link searchRelative} 对账后的 props 渲染成厂商控件。 */
  protected abstract createSearchRelative(
    field: MetaUiField,
    context: VuiContext<any>,
    props: VuiSearchRelativeProps,
  ): VNode

  protected fieldDisplayText(
    field: MetaUiField,
    context: UiContext,
    props?: VuiFieldCellProps,
  ): string {
    const value = context.displayField(field, props?.row)
    return value == null ? '' : String(value)
  }

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

  fallbackDisplay: VuiFieldRenderer = (field, context, props) =>
    h(
      'output',
      { class: 'mmda-display', ...props },
      this.fieldDisplayText(field, context, props),
    )

  textSpan = this.fallbackDisplay

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

  signaturePad: VuiFieldRenderer = (field, context) =>
    this.factory.signaturePad(signaturePadPropsFromField(field, context))

  stepper: VuiFieldRenderer = (field, context) =>
    this.factory.stepper(stepperPropsFromField(field, context))

  inplaceFieldEditor: VuiFieldRenderer = (field, context) => {
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
