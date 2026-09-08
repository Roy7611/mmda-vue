/*
 * chrome 就地编辑壳走 factory.inplaceEditor。
 * 对照 Prime Inplace：点 display 换成 content。
 * 不要 inplace / ejs-inplaceeditor / InPlaceEditor / Prime Inplace 当 vui 名。
 * 不要 inplaceEdit（表格列 Logic / nativeInplaceEdit）。
 * 没有 default 槽。控件不 saveOne。
 */
import type { VNode } from 'vue'
import type { PropData } from '../layout/layout'

export interface UiInplaceEditorController {
  open: () => void
  close: () => void
}

export interface UiInplaceEditorProps extends PropData {
  /** 可选受控。缺省点 display 打开 */
  active?: boolean
  disabled?: boolean
  onOpen?: () => void
  onClose?: () => void
  onReady?: (controller: UiInplaceEditorController) => void
}

export interface UiInplaceEditorSlots {
  display?: () => VNode[] | VNode | undefined
  content?: () => VNode[] | VNode | undefined
}

export const noopInplaceEditorController: UiInplaceEditorController = {
  open: () => undefined,
  close: () => undefined,
}

export function inplaceEditorDisabledOf(
  props: UiInplaceEditorProps,
): boolean {
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
    'mmda-inplace-editor',
    extra?.open || props.active === true
      ? 'mmda-inplace-editor--open'
      : undefined,
    inplaceEditorDisabledOf(props) ? 'mmda-inplace-editor--disabled' : undefined,
    props.class,
  ]
}

export function isInplaceFieldEditorKey(name?: string): boolean {
  if (!name) return false
  return (
    name === 'inplaceFieldEditor' ||
    name === 'InplaceFieldEditor'
  )
}
