import { uiCssClass } from '../css'

export type UiSplitterOrientation = 'Horizontal' | 'Vertical'

export interface UiSplitterPane<TNode = any> {
  content: TNode
  size?: string
  min?: string
  max?: string
  collapsible?: boolean
  collapsed?: boolean
  resizable?: boolean
  cssClass?: string
}

export interface UiSplitterCollapseEvent {
  index: number
  collapsed: boolean
}

export interface UiSplitterResizeEvent {
  index: number
  paneSize?: number[]
}

export interface UiSplitterProps {
  orientation?: UiSplitterOrientation
  class?: string
  width?: string
  height?: string
  separatorSize?: number
  enabled?: boolean
  enableReversePanes?: boolean
  collapseTick?: number
  onCollapsed?: (event: UiSplitterCollapseEvent) => void
  onExpanded?: (event: UiSplitterCollapseEvent) => void
  onResizeStart?: (event: UiSplitterResizeEvent) => void
  onResizing?: (event: UiSplitterResizeEvent) => void
  onResizeStop?: (event: UiSplitterResizeEvent) => void
}

export const DEFAULT_SPLITTER_SIZE = '100%'

function isFalse(raw: unknown): boolean {
  return raw === false || raw === 'false'
}

function isTrue(raw: unknown): boolean {
  return raw === true || raw === 'true'
}

export function splitterModifierClasses(props: UiSplitterProps = {}): unknown[] {
  const orientation =
    props.orientation === 'Vertical' ? 'Vertical' : 'Horizontal'
  const reverse = props.enableReversePanes === true
  return [
    uiCssClass('splitter'),
    orientation === 'Vertical'
      ? uiCssClass('splitter', undefined, 'vertical')
      : uiCssClass('splitter', undefined, 'horizontal'),
    reverse ? uiCssClass('splitter', undefined, 'reverse') : undefined,
    props.class,
  ]
}

export function splitterOrientationOf(
  props: UiSplitterProps = {},
): UiSplitterOrientation {
  return props.orientation === 'Vertical' ? 'Vertical' : 'Horizontal'
}

export function splitterEnabledOf(props: UiSplitterProps = {}): boolean {
  if (props.enabled === undefined) return true
  return !isFalse(props.enabled)
}

export function splitterReversePanesOf(props: UiSplitterProps = {}): boolean {
  return isTrue(props.enableReversePanes)
}

export function splitterWidthOf(props: UiSplitterProps = {}): string {
  return props.width ?? DEFAULT_SPLITTER_SIZE
}

export function splitterHeightOf(props: UiSplitterProps = {}): string {
  return props.height ?? DEFAULT_SPLITTER_SIZE
}

/** EJ2 collapsed/resize 的 index 可能是 `[prev, next]`，不能 Number(数组)。 */
export function splitterEventIndex(args?: {
  index?: number | number[]
}): number {
  const raw = args?.index
  if (Array.isArray(raw)) return Number(raw[0] ?? 0)
  return Number(raw ?? 0)
}

export function emitSplitterResize(
  props: UiSplitterProps,
  phase: 'start' | 'resizing' | 'stop',
  args?: { index?: number | number[]; paneSize?: number[] },
): void {
  const event: UiSplitterResizeEvent = {
    index: splitterEventIndex(args),
    paneSize: Array.isArray(args?.paneSize) ? args.paneSize : undefined,
  }
  if (phase === 'start') props.onResizeStart?.(event)
  else if (phase === 'resizing') props.onResizing?.(event)
  else props.onResizeStop?.(event)
}
