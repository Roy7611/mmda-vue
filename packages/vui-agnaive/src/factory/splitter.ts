import { h } from 'vue'
import { NSplit } from 'naive-ui'
import type { UiSplitterPane, UiSplitterProps } from '@mmda/vui'
import {
  emitSplitterResize,
  splitterEnabledOf,
  splitterModifierClasses,
  splitterOrientationOf
} from '@mmda/vui'
import { uiRenderProps } from '@mmda/core'

/**
 * NSplit 拖动时用 seemly.depx 解析 min/max；depx('12rem') === NaN，会导致拖不动。
 * 初始 defaultSize 可用 rem（flex-basis），但 min/max 必须是 px。
 */
function toPxLength(value: string | undefined, fallbackPx: number): string {
  if (!value?.trim()) return `${fallbackPx}px`
  const raw = value.trim()
  const n = parseFloat(raw)
  if (!Number.isFinite(n)) return `${fallbackPx}px`
  if (raw.endsWith('rem')) return `${n * 16}px`
  if (raw.endsWith('em')) return `${n * 16}px`
  if (raw.endsWith('%')) return raw
  if (raw.endsWith('px')) return raw
  return `${n}px`
}

export function createSplitter(
  panes: UiSplitterPane[],
  props: UiSplitterProps = {},
) {
  const orientation = splitterOrientationOf(props)
  const first = panes[0]
  const defaultSize = first?.collapsed
    ? '0px'
    : toPxLength(first?.size, 256)
  return h(
    NSplit,
    {
      ...uiRenderProps(props).attributes,
      class: [
        'mmda-splitter',
        ...splitterModifierClasses(props).flat(),
      ].filter(Boolean).join(' '),
      direction: orientation === 'Vertical' ? 'vertical' : 'horizontal',
      disabled: !splitterEnabledOf(props),
      defaultSize,
      min: toPxLength(first?.min, 192),
      max: first?.max?.trim() ? toPxLength(first.max, 0) : undefined,
      pane1Class: first?.cssClass,
      pane2Class: panes[1]?.cssClass,
      pane1Style: { minWidth: 0, minHeight: 0, overflow: 'hidden' },
      pane2Style: {
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      },
      resizeTriggerSize: Math.max(props.separatorSize ?? 8, 6),
      'onUpdate:size': (size: number | string) =>
        emitSplitterResize(props, 'stop', {
          index: 0,
          paneSize: [typeof size === 'number' ? size : parseFloat(size)],
        }),
    },
    {
      1: () => panes[0]?.content,
      2: () => panes[1]?.content,
    },
  )
}
