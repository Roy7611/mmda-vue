import type { UiProps } from '../props'
import { uiCssClass } from '../css'

export type UiSidebarPosition = 'Left' | 'Right'
export type UiSidebarType = 'Over' | 'Push' | 'Slide' | 'Auto'

export interface UiSidebarProps extends UiProps {
  isOpen?: boolean
  position?: UiSidebarPosition
  type?: UiSidebarType
  width?: string | number
  showBackdrop?: boolean
  enableDock?: boolean
  dockSize?: string | number
  target?: string | unknown
  mediaQuery?: string | unknown
  enableGestures?: boolean
  onChange?: (isOpen: boolean) => void
}

export type UiDrawerProps = Omit<UiSidebarProps, 'type'>

export function sidebarModifierClasses(
  props: UiSidebarProps,
  asDrawer = false,
): unknown[] {
  const type: UiSidebarType = asDrawer
    ? 'Over'
    : props.type === 'Over' ||
        props.type === 'Push' ||
        props.type === 'Slide' ||
        props.type === 'Auto'
      ? props.type
      : 'Auto'
  const dock = props.enableDock === true
  return [
    uiCssClass('sidebar'),
    asDrawer ? uiCssClass('sidebar', 'drawer') : undefined,
    uiCssClass('sidebar', type.toLowerCase()),
    dock ? uiCssClass('sidebar', 'dock') : undefined,
    props.class,
  ]
}
