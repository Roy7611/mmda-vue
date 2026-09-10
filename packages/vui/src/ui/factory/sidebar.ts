/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/sidebar/vue-3-getting-started
 *
 * chrome 侧栏走 factory.sidebar。type / position / isOpen 用 EJ2 词。
 * factory.drawer 是同一控件的 Over 特化（覆盖弹层），不是第二套实现。
 * 不要 vui 主名 visible / show（只在 drawer 入口翻译旧词）。
 */
import type { VNode } from 'vue'
import type {UiProps, UiSlots} from '../layout/layout'

export const DEFAULT_SIDEBAR_WIDTH = 280

export type {
  UiDrawerProps,
  UiSidebarPosition,
  UiSidebarProps,
  UiSidebarType,
} from '@mmda/core'
import { callUiBagFn } from '@mmda/core'
import type {
  UiDrawerProps,
  UiSidebarPosition,
  UiSidebarProps,
  UiSidebarType,
} from '@mmda/core'

export type UiSidebarSlots = UiSlots

function isTrue(raw: unknown): boolean {
  return raw === true || raw === 'true'
}

function isFalse(raw: unknown): boolean {
  return raw === false || raw === 'false'
}

export function sidebarIsOpenOf(props: UiSidebarProps): boolean {
  if (props.isOpen !== undefined) return isTrue(props.isOpen)
  if (props.modelValue !== undefined) return isTrue(props.modelValue)
  return false
}

export function sidebarPositionOf(props: UiSidebarProps): UiSidebarPosition {
  return props.position === 'Right' ? 'Right' : 'Left'
}

export function sidebarTypeOf(
  props: UiSidebarProps,
  asDrawer = false,
): UiSidebarType {
  if (asDrawer) return 'Over'
  const t = props.type
  if (t === 'Over' || t === 'Push' || t === 'Slide' || t === 'Auto') return t
  return 'Auto'
}

export function sidebarWidthOf(props: UiSidebarProps): string | number {
  if (props.width == null || props.width === '') return DEFAULT_SIDEBAR_WIDTH
  return props.width
}

export function sidebarShowBackdropOf(
  props: UiSidebarProps,
  asDrawer = false,
): boolean {
  if (props.showBackdrop !== undefined) return isTrue(props.showBackdrop)
  return asDrawer
}

export function sidebarCloseOnDocumentClickOf(
  props: UiSidebarProps,
  asDrawer = false,
): boolean {
  if (props.closeOnDocumentClick !== undefined) {
    return isTrue(props.closeOnDocumentClick)
  }
  return asDrawer
}

export function sidebarEnableDockOf(props: UiSidebarProps): boolean {
  return isTrue(props.enableDock)
}

export function sidebarEnableGesturesOf(props: UiSidebarProps): boolean {
  if (props.enableGestures === undefined) return true
  return !isFalse(props.enableGestures)
}

/** drawer 入口：锁 Over、默认遮罩；翻译 visible / show / onUpdateVisible */
export function applyDrawerDefaults(props: UiSidebarProps): UiSidebarProps {
  const loose = props as UiProps
  const openRaw =
    props.isOpen !== undefined
      ? props.isOpen
      : (loose.visible ?? loose.show ?? props.modelValue)
  const onChange =
    props.onChange ??
    loose.onUpdateVisible ??
    loose['onUpdate:visible'] ??
    loose['onUpdate:show']
  return {
    ...props,
    isOpen: isTrue(openRaw),
    type: 'Over',
    showBackdrop:
      props.showBackdrop === undefined ? true : isTrue(props.showBackdrop),
    closeOnDocumentClick:
      props.closeOnDocumentClick === undefined
        ? true
        : isTrue(props.closeOnDocumentClick),
    onChange:
      typeof onChange === 'function'
        ? (onChange as (isOpen: boolean) => void)
        : props.onChange,
  }
}

export function emitSidebarChange(
  props: UiSidebarProps,
  isOpen: unknown,
): void {
  const next = isTrue(isOpen)
  props.onChange?.(next)
  callUiBagFn(props, 'onUpdate:modelValue', next)
  callUiBagFn(props, 'onUpdate', next)
}

export { sidebarModifierClasses } from '@mmda/core'

export function sidebarSlotsOf(
  slots?: UiSidebarSlots,
): Record<string, unknown> | undefined {
  if (!slots) return undefined
  const next: Record<string, unknown> = {}
  if (slots.default) next.default = slots.default
  if (slots.header) next.header = slots.header
  return Object.keys(next).length ? next : undefined
}

export type SidebarFactoryFn = (
  props: UiSidebarProps,
  slots?: UiSidebarSlots,
) => VNode
