import {
  inplaceEditorDisabledOf,
  isInplaceFieldEditorKey,
  type MetaUiField,
  type UiInplaceEditorProps,
} from '@mmda/core'
import { h, type VNode } from 'vue'
import type {UiProps} from '../layout/layout'
import type { UiFieldFactory } from './field_factory'
import type { UiFieldRenderer } from '@mmda/core'

type Ctx = {
  isFieldReadonly: (field: MetaUiField | string) => boolean
  uiBuilder?: {
    factory?: {
      inplaceEditor?: (
        props: UiInplaceEditorProps,
        slots?: {
          display?: () => VNode[] | VNode | undefined
          content?: () => VNode[] | VNode | undefined
        },
      ) => VNode
    }
  }
}

export function inplaceFieldDisplayRenderer(
  field: MetaUiField,
  fieldFactory: UiFieldFactory,
): UiFieldRenderer<VNode> {
  if (
    field.renderer &&
    !isInplaceFieldEditorKey(field.renderer) &&
    typeof fieldFactory[field.renderer] === 'function'
  ) {
    return fieldFactory[field.renderer]
  }
  return fieldFactory.fallbackDisplay
}

export function inplaceFieldContentRenderer(
  field: MetaUiField,
  fieldFactory: UiFieldFactory,
): UiFieldRenderer<VNode> {
  if (
    field.editor &&
    !isInplaceFieldEditorKey(field.editor) &&
    typeof fieldFactory[field.editor] === 'function'
  ) {
    return fieldFactory[field.editor]
  }
  return fieldFactory.fallbackInput
}

export function renderInplaceFieldEditor(
  field: MetaUiField,
  context: Ctx,
  extra: UiProps = {},
  fieldFactory: UiFieldFactory,
): VNode {
  const display = inplaceFieldDisplayRenderer(field, fieldFactory)
  const content = inplaceFieldContentRenderer(field, fieldFactory)
  const disabled =
    extra.disabled === true || context.isFieldReadonly(field)
  const chrome = context.uiBuilder?.factory?.inplaceEditor
  if (!chrome || disabled) {
    return display(field, context as any, extra)
  }
  return chrome(
    {
      disabled: inplaceEditorDisabledOf({ disabled }),
      active: extra.active as boolean | undefined,
      onOpen: extra.onOpen as UiInplaceEditorProps['onOpen'],
      onClose: extra.onClose as UiInplaceEditorProps['onClose'],
      class: extra.class,
      htmlAttributes: extra.htmlAttributes,
    },
    {
      display: () => display(field, context as any, extra),
      content: () => content(field, context as any, extra),
    },
  )
}
