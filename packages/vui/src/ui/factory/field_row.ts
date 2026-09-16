import { h, type VNode } from 'vue'
import {
  SqlDataType,
  uiCssClass,
  type MetaUiField,
  type UiLayout,
} from '@mmda/core'
import type { UiProps } from '../layout'
import type { VueUiContext } from '../../contexts/vue_ui_context'
import type { UiFieldFactory } from '../field_factory'

type UiContext = VueUiContext<any>

/**
 * 给字段工厂挂上带标签行的三个入口：`render` / `editFor` / `displayFor`。
 * 具名 editor/renderer 仍是裸控件；表格单元格不要走这里。
 * Validation copy is drawn by skin controls, not layoutField.
 *
 * vui 在 Builder 构造时调用一次；皮肤不必各自实现。
 */
export function attachFieldRowApi(
  fieldFactory: UiFieldFactory,
  layout: UiLayout<VNode>,
): UiFieldFactory {
  fieldFactory.layout = layout

  const labelFor = (field: MetaUiField, props?: UiProps): VNode =>
    h(
      'label',
      {
        for: field.fieldName,
        key: field.fieldName,
        class: uiCssClass('field-label'),
        ...props,
      },
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
      (field.editor ? fieldFactory[field.editor] : undefined) ??
      fieldFactory.fallbackInput
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
      fieldFactory[fieldDisplayName(field)] ??
      fieldFactory.fallbackDisplay
    return renderer(field, context, props)
  }

  const wrapRow = (
    field: MetaUiField,
    _context: UiContext,
    control: VNode,
    props: UiProps,
    _useEditor: boolean,
  ): VNode => {
    const {
      editing: _editing,
      direction,
      orientation,
      isReadonly: _isReadonly,
      fieldVertical,
      gridColumn,
      gridRow,
      ..._controlProps
    } = props as UiProps & {
      fieldVertical?: boolean
      gridColumn?: string
      gridRow?: string
    }
    const slots = {
      label: labelFor(field),
      control,
      gridColumn,
      gridRow,
    }
    // 单次调用可覆写全局 layout.fieldVertical（cards 页组默认传 true）
    const useVert =
      fieldVertical === true ||
      orientation === 'vertical' ||
      direction === 'vertical'
    return useVert
      ? layout.layoutFieldVert(slots)
      : layout.layoutField(slots)
  }

  fieldFactory.editFor = (
    field: MetaUiField,
    context: any,
    props: Record<string, unknown> = {},
  ): VNode => {
    const {
      editing: _e,
      direction: _d,
      orientation: _o,
      isReadonly: _r,
      fieldVertical: _fv,
      gridColumn: _gc,
      gridRow: _gr,
      ...controlProps
    } = props as UiProps & {
      fieldVertical?: boolean
      gridColumn?: string
      gridRow?: string
    }
    return wrapRow(
      field,
      context,
      resolveEditor(field, context, controlProps),
      props as UiProps,
      true,
    )
  }

  fieldFactory.displayFor = (
    field: MetaUiField,
    context: any,
    props: Record<string, unknown> = {},
  ): VNode => {
    const {
      editing: _e,
      direction: _d,
      orientation: _o,
      isReadonly: _r,
      fieldVertical: _fv,
      gridColumn: _gc,
      gridRow: _gr,
      ...controlProps
    } = props as UiProps & {
      fieldVertical?: boolean
      gridColumn?: string
      gridRow?: string
    }
    return wrapRow(
      field,
      context,
      resolveDisplay(field, context, controlProps),
      props as UiProps,
      false,
    )
  }

  fieldFactory.render = (
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
      ? fieldFactory.editFor!(field, context, props)
      : fieldFactory.displayFor!(field, context, props)
  }

  return fieldFactory
}
