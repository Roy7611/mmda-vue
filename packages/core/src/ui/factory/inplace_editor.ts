import type { UiProps } from '../props'
import { uiCssClass } from '../css'

export interface UiInplaceEditorController {
  open: () => void
  close: () => void
}

export interface UiInplaceEditorProps extends UiProps {
  active?: boolean
  disabled?: boolean
  onOpen?: () => void
  onClose?: () => void
  onReady?: (controller: UiInplaceEditorController) => void
}

export interface UiInplaceEditorSlots<TNode = any> {
  display?: () => TNode | TNode[] | undefined
  content?: () => TNode | TNode[] | undefined
}

export const noopInplaceEditorController: UiInplaceEditorController = {
  open: () => undefined,
  close: () => undefined,
}

export function inplaceEditorDisabledOf(props: UiInplaceEditorProps): boolean {
  return props.disabled === true
}

export function inplaceEditorActiveOf(
  props: UiInplaceEditorProps,
): boolean | undefined {
  if (props.active === true) return true
  if (props.active === false) return false
  return undefined
}

export function inplaceEditorModifierClasses(
  props: UiInplaceEditorProps,
  extra?: { open?: boolean },
): unknown[] {
  return [
    uiCssClass('inplace-editor'),
    extra?.open || props.active === true
      ? uiCssClass('inplace-editor', 'open')
      : undefined,
    inplaceEditorDisabledOf(props)
      ? uiCssClass('inplace-editor', 'disabled')
      : undefined,
    props.class,
  ]
}

export function isInplaceFieldEditorKey(name?: string): boolean {
  if (!name) return false
  return name === 'inplaceFieldEditor' || name === 'InplaceFieldEditor'
}
