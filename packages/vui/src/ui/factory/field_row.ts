import { h, type VNode } from 'vue'
import {
  SqlDataType,
  type MetaUiField,
  type UiLayout,
  type UiOrientation,
} from '@mmda/core'
import type { UiProps } from '../layout/layout'
import type { VueUiContext } from '../../contexts/vue_ui_context'
import type { UiFieldFactory } from './field_factory'

type UiContext = VueUiContext<any>

/**
 * 给字段工厂挂上带标签行的三个入口：`render` / `editFor` / `displayFor`。
 * 具名 editor/renderer 仍是裸控件；表格单元格不要走这里。
 *
 * vui 在 Builder 构造时调用一次；皮肤不必各自实现。
 */
export function attachFieldRowApi(
  fldFactory: UiFieldFactory,
  layout: UiLayout<VNode>,
): UiFieldFactory {
  fldFactory.layout = layout

  const labelFor = (field: MetaUiField, props?: UiProps): VNode =>
    h(
      'label',
      { for: field.fieldName, key: field.fieldName, ...props },
      field.displayLabel,
    )

  const fieldDisplayName = (field: MetaUiField): string => {
    if (field.renderer) return field.renderer
    if (SqlDataType.isBool(field.dataType)) return 'checkedIcon'
    return 'textSpan'
  }

  /** 裸编辑控件（不含标签布局）。 */
  const resolveEditor = (
    field: MetaUiField,
    context: UiContext,
    props: UiProps = {},
  ): VNode => {
    const logic = context.getFieldLogic(field) as
      | { customEditor?: (f: MetaUiField, c: UiContext, p?: UiProps) => VNode }
      | undefined
    const renderer =
      logic?.customEditor ??
      (field.editor ? fldFactory[field.editor] : undefined) ??
      fldFactory.fallbackInput
    return renderer(field, context, props)
  }

  /** 裸展示控件（不含标签布局）。 */
  const resolveDisplay = (
    field: MetaUiField,
    context: UiContext,
    props: UiProps = {},
  ): VNode => {
    const logic = context.getFieldLogic(field) as
      | {
          customRenderer?: (
            f: MetaUiField,
            c: UiContext,
            p?: UiProps,
          ) => VNode
        }
      | undefined
    const renderer =
      logic?.customRenderer ??
      fldFactory[fieldDisplayName(field)] ??
      fldFactory.fallbackDisplay
    return renderer(field, context, props)
  }

  const wrapRow = (
    field: MetaUiField,
    context: UiContext,
    control: VNode,
    props: UiProps,
    useEditor: boolean,
  ): VNode => {
    const {
      editing: _editing,
      direction,
      orientation,
      isReadonly: _isReadonly,
      ..._controlProps
    } = props
    const runtime = context as UiContext & {
      isInvalid?: (field: MetaUiField) => boolean
      getInvalidMessage?: (field: MetaUiField) => string
    }
    const invalid = useEditor && runtime.isInvalid?.(field)
    const message =
      invalid && layout.fieldMessage
        ? h(
            'small',
            { class: 'mmda-field-error' },
            runtime.getInvalidMessage?.(field),
          )
        : undefined
    return layout.layoutField({
      label: labelFor(field),
      control,
      message,
      orientation:
        (orientation as UiOrientation | undefined) ??
        (direction as UiOrientation | undefined) ??
        layout.fieldLayout,
      props: { key: field.fieldName },
    })
  }

  fldFactory.editFor = (
    field: MetaUiField,
    context: any,
    props: Record<string, unknown> = {},
  ): VNode => {
    const {
      editing: _e,
      direction: _d,
      orientation: _o,
      isReadonly: _r,
      ...controlProps
    } = props as UiProps
    return wrapRow(
      field,
      context,
      resolveEditor(field, context, controlProps),
      props as UiProps,
      true,
    )
  }

  fldFactory.displayFor = (
    field: MetaUiField,
    context: any,
    props: Record<string, unknown> = {},
  ): VNode => {
    const {
      editing: _e,
      direction: _d,
      orientation: _o,
      isReadonly: _r,
      ...controlProps
    } = props as UiProps
    return wrapRow(
      field,
      context,
      resolveDisplay(field, context, controlProps),
      props as UiProps,
      false,
    )
  }

  fldFactory.render = (
    field: MetaUiField,
    context: any,
    props: Record<string, unknown> = {},
  ): VNode => {
    if (context.isFieldHidden?.(field)) {
      return h('span', { hidden: true })
    }
    const uiProps = props as UiProps
    const editing = (uiProps.editing as boolean | undefined) ?? context.editing
    const isReadonly = uiProps.isReadonly as boolean | undefined
    const useEditor =
      Boolean(editing) &&
      !context.isFieldReadonly?.(field) &&
      !isReadonly
    return useEditor
      ? fldFactory.editFor!(field, context, props)
      : fldFactory.displayFor!(field, context, props)
  }

  return fldFactory
}
