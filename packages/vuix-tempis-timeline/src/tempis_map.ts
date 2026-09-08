import type { UiTimelineProps } from '@mmda/vui'
import { tempisItemsOf } from '@mmda/vui'

export function tempisOptionsOf(props: UiTimelineProps): Record<string, unknown> {
  const items = tempisItemsOf(props)
  const range = props.range
    ? {
        start: props.range.start,
        end: props.range.end,
      }
    : undefined
  return {
    responsive: true,
    items,
    range,
    rtl: Boolean(props.rtl),
  }
}
