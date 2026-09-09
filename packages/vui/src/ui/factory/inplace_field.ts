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
  fldFactory: UiFieldFactory,
): UiFieldRenderer<VNode> {
  if (
    field.renderer &&
    !isInplaceFieldEditorKey(field.renderer) &&
    typeof fldFactory[field.renderer] === 'function'
  ) {
    return fldFactory[field.renderer]
  }
  return fldFactory.fallbackDisplay
}

export function inplaceFieldContentRenderer(
  field: MetaUiField,
  fldFactory: UiFieldFactory,
): UiFieldRenderer<VNode> {
  if (
    field.editor &&
    !isInplaceFieldEditorKey(field.editor) &&
    typeof fldFactory[field.editor] === 'function'
  ) {
    return fldFactory[field.editor]
  }
  return fldFactory.fallbackInput
}

export function renderInplaceFieldEditor(
  field: MetaUiField,
  context: Ctx,
  extra: UiProps = {},
  fldFactory: UiFieldFactory,
): VNode {
  const display = inplaceFieldDisplayRenderer(field, fldFactory)
  const content = inplaceFieldContentRenderer(field, fldFactory)
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
