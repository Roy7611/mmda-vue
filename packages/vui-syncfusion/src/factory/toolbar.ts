import type { UiToolbarProps, UiToolbarSlots } from "@mmda/vui"
import { renderToolbarChrome } from "@mmda/vui"

export function createToolbar(props: UiToolbarProps, slots?: UiToolbarSlots) {
  return renderToolbarChrome(props, slots);
}
