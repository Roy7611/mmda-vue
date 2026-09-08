/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/sidebar/vue-3-getting-started
 *
 * chrome 侧栏走 factory.sidebar。type / position / isOpen 用 EJ2 词。
 * factory.drawer 是同一控件的 Over 特化（覆盖弹层），不是第二套实现。
 * 不要 vui 主名 visible / show（只在 drawer 入口翻译旧词）。
 */
import type { VNode } from 'vue'
import type { PropData, UiSlots } from '../layout/layout'

export const DEFAULT_SIDEBAR_WIDTH = 280

export type UiSidebarPosition = 'Left' | 'Right'

export type UiSidebarType = 'Over' | 'Push' | 'Slide' | 'Auto'

export interface UiSidebarProps extends PropData {
  isOpen?: boolean
  position?: UiSidebarPosition
  /** 仅 sidebar；drawer 忽略并锁 Over */
  type?: UiSidebarType
  width?: string | number
  showBackdrop?: boolean
  enableDock?: boolean
  dockSize?: string | number
  target?: string | HTMLElement
  mediaQuery?: string | MediaQueryList
  /** EJ2：触摸滑动。未写时跟 SF 默认 true */
  enableGestures?: boolean
  onChange?: (isOpen: boolean) => void
}

export type UiSidebarSlots = UiSlots

export type UiDrawerProps = Omit<UiSidebarProps, 'type'>

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

export function sidebarEnableDockOf(props: UiSidebarProps): boolean {
  return isTrue(props.enableDock)
}

export function sidebarEnableGesturesOf(props: UiSidebarProps): boolean {
  if (props.enableGestures === undefined) return true
  return !isFalse(props.enableGestures)
}

/** drawer 入口：锁 Over、默认遮罩；翻译 visible / show / onUpdateVisible */
export function applyDrawerDefaults(props: UiSidebarProps): UiSidebarProps {
  const loose = props as PropData
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
    onChange: typeof onChange === 'function' ? onChange : props.onChange,
  }
}

export function emitSidebarChange(
  props: UiSidebarProps,
  isOpen: unknown,
): void {
  const next = isTrue(isOpen)
  props.onChange?.(next)
  props['onUpdate:modelValue']?.(next)
  props.onUpdate?.(next)
}

export function sidebarModifierClasses(
  props: UiSidebarProps,
  asDrawer = false,
): unknown[] {
  const type = sidebarTypeOf(props, asDrawer)
  return [
    'mmda-sidebar',
    asDrawer ? 'mmda-sidebar--drawer' : undefined,
    `mmda-sidebar--${type.toLowerCase()}`,
    sidebarEnableDockOf(props) ? 'mmda-sidebar--dock' : undefined,
    props.class,
  ]
}

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
