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
  /** 点遮罩 / 文档空白处关闭（drawer 默认应开启） */
  closeOnDocumentClick?: boolean
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
    asDrawer ? uiCssClass('sidebar', undefined, 'drawer') : undefined,
    uiCssClass('sidebar', undefined, type.toLowerCase()),
    dock ? uiCssClass('sidebar', undefined, 'dock') : undefined,
    props.class,
  ]
}
