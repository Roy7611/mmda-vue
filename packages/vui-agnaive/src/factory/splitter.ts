import { h } from 'vue'
import { NSplit } from 'naive-ui'
import type { UiSplitterPane, UiSplitterProps } from '@mmda/vui'
import { emitSplitterResize, htmlAttributesOf, splitterModifierClasses, splitterOrientationOf } from '@mmda/vui'

function parseCssSize(value?: string): number | undefined {
  if (!value) return undefined
  const n = parseFloat(value)
  if (!Number.isFinite(n)) return undefined
  if (value.endsWith('rem')) return n * 16
  return n
}

export function createSplitter(
  panes: UiSplitterPane[],
  props: UiSplitterProps = {},
) {
  const orientation = splitterOrientationOf(props)
  return h(
    NSplit,
    {
      ...htmlAttributesOf(props),
      class: [
        'mmda-splitter',
        ...splitterModifierClasses(props).flat(),
      ].filter(Boolean).join(' '),
      direction: orientation === 'Vertical' ? 'vertical' : 'horizontal',
      defaultSize: panes[0]?.collapsed
        ? 0
        : (parseCssSize(panes[0]?.size) ?? 256),
      min: parseCssSize(panes[0]?.min) ?? 192,
      max: parseCssSize(panes[0]?.max),
      'onUpdate:size': (size: number) =>
        emitSplitterResize(props, 'stop', { index: 0, paneSize: [size] }),
    },
    {
      1: () => panes[0]?.content,
      2: () => panes[1]?.content,
    },
  )
}
