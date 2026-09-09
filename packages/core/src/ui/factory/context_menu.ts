import type { UiMenuItem } from '../action'
import type { UiProps } from '../props'
import { uiCssClass } from '../css'

export interface UiContextMenuProps extends UiProps {
  items?: UiMenuItem[]
  /** CSS 选择器。对应 EJ2 `target`。 */
  target?: string
  disabled?: boolean
  onSelect?: (item: UiMenuItem) => void
  onBeforeOpen?: (args: { event?: Event }) => void | boolean
}

export function contextMenuModifierClasses(props: UiProps = {}): unknown[] {
  return [uiCssClass('context-menu'), props.class]
}
