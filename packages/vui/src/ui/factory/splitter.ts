/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/splitter/vue3-getting-started
 *
 * chrome 分隔栏走 factory.splitter(panes, props)。orientation / pane 用 EJ2 词。
 * 不要 vui 主名 layout / direction / panels / paneSettings。
 * 嵌套：pane.content 再放 factory.splitter(...)，没有第二个 chrome 名。
 */
import type {
  UiSplitterCollapseEvent,
  UiSplitterOrientation,
  UiSplitterProps,
  UiSplitterResizeEvent,
} from '@mmda/core'

export type {
  UiSplitterCollapseEvent,
  UiSplitterOrientation,
  UiSplitterPane,
  UiSplitterProps,
  UiSplitterResizeEvent,
} from '@mmda/core'

export const DEFAULT_SPLITTER_SIZE = '100%'

function isFalse(raw: unknown): boolean {
  return raw === false || raw === 'false'
}

function isTrue(raw: unknown): boolean {
  return raw === true || raw === 'true'
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

export { splitterModifierClasses } from '@mmda/core'

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
