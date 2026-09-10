import type { UiHorzAlign } from '../layout'
import type { UiProps } from '../props'
import { uiCssClass } from '../css'

export type UiToolbarLayout = 'full' | 'medium' | 'compact'
export type UiToolbarSlotName = 'start' | 'center' | 'end'

export interface UiToolbarProps extends UiProps {
  align?: {
    start?: UiHorzAlign
    center?: UiHorzAlign
    end?: UiHorzAlign
  }
  layout?: UiToolbarLayout
}

export interface UiToolbarSlots<TNode = any> {
  start?: () => unknown
  center?: () => unknown
  end?: () => unknown
}

const TOOLBAR_SLOT_ALIGN: Record<UiToolbarSlotName, UiHorzAlign> = {
  start: 'left',
  center: 'center',
  end: 'right',
}

export function toolbarModifierClasses(
  props: UiToolbarProps = {},
  slots?: UiToolbarSlots,
): unknown[] {
  const layout =
    props.layout === 'medium' || props.layout === 'compact'
      ? props.layout
      : undefined
  const hasCenter = typeof slots?.center === 'function'
  return [
    uiCssClass('toolbar'),
    layout ? uiCssClass('toolbar', undefined, layout) : undefined,
    hasCenter ? uiCssClass('toolbar', undefined, 'with-center') : undefined,
    props.class,
  ]
}

export function toolbarSlotModifierClasses(
  props: UiToolbarProps = {},
  slot: UiToolbarSlotName,
): unknown[] {
  const raw = props.align?.[slot]
  const align =
    raw === 'left' || raw === 'center' || raw === 'right'
      ? raw
      : TOOLBAR_SLOT_ALIGN[slot]
  return [
    uiCssClass('toolbar', slot),
    uiCssClass('toolbar', slot, align),
  ]
}
