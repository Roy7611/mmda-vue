import { createElement, type ReactNode } from 'react'
import {
  AbstractUiFieldFactory,
  isInplaceFieldEditorKey,
  fileLinkPropsFromField,
  fileUploaderPropsFromField,
  filesUploaderPropsFromField,
  imageUploaderPropsFromField,
  imagesUploaderPropsFromField,
  numberInputPropsFromField,
  relativeTime as formatRelativeTime,
  resolveFieldUnit,
  signaturePadPropsFromField,
  stepperPropsFromField,
  timelineSqlOf,
  type MetaUiField,
  type UiContext,
  type UiFieldFactory,
  type UiFieldRenderer,
} from '@mmda/core'
import { RuiFactory } from './factory'

const fieldDisplayText = (
  field: MetaUiField,
  context: UiContext,
): string => {
  const value = context.displayField(field)
  return value == null ? '' : String(value)
}

/**
 * React 字段工厂。输入控件映射表在 core {@link AbstractUiFieldFactory}；
 * 这里只实现 `control` 的 `createElement` 版本与框架专属的只读展示 / 上传。
 */
export class RuiFieldFactory
  extends AbstractUiFieldFactory<ReactNode, RuiFactory>
  implements UiFieldFactory<ReactNode>
{
  constructor(factory: RuiFactory) {
    super(factory)
  }

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

  numberInput: UiFieldRenderer<ReactNode> = (field, context) =>
    this.control(
      field,
      context,
      this.factory.numberInput(numberInputPropsFromField(field, context)),
    )

  fallbackDisplay: UiFieldRenderer<ReactNode> = (field, context) =>
    this.factory.textSpan({ text: fieldDisplayText(field, context) })

  textSpan = this.fallbackDisplay

  quantityUnit: UiFieldRenderer<ReactNode> = (field, context) => {
    const value = context.getFieldValue(field)
    const unit = resolveFieldUnit(field)
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
      formatRelativeTime(
        timelineSqlOf(context.getFieldValue(field)) ?? '',
        context.locale,
      ),
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

  inplaceFieldEditor: UiFieldRenderer<ReactNode> = (field, context) => {
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
