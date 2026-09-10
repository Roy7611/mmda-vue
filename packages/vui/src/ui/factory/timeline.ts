/*
 * chrome 时间轴走 factory.timeline。
 * 契约在 @mmda/core ui/timeline.ts。插件接口留 vui。
 */
import type { MetaUiField, UiTimelineProps } from '@mmda/core'
import type { VNode } from 'vue'
import type {UiProps} from '../layout/layout'

export type {
  UiTimelineAlign,
  UiTimelineController,
  UiTimelineFieldOf,
  UiTimelineItem,
  UiTimelineProps,
  UiTimelineRange,
  UiTimelineTimeDisplay,
} from '@mmda/core'
export {
  noopTimelineController,
  tempisItemsOf,
  timelineAlignOf,
  timelineAlignToEj2,
  timelineItemsOf,
  timelineListContentOf,
  timelineListOppositeOf,
  timelineModifierClasses,
  timelineOrientationOf,
  timelineOrientationToEj2,
  timelineSqlOf,
  timelineTimeTextOf,
} from '@mmda/core'

export interface UiTimelinePlugin {
  timeline: (props: UiTimelineProps) => VNode
}

export type TimelineFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  isFieldReadonly?: (field: MetaUiField | string) => boolean
}

export function emitTimelineRangeChange(
  props: UiTimelineProps,
  start: Date,
  end: Date,
): void {
  props.onRangeChange?.(start, end)
}

export function timelinePropsFromField(
  field: MetaUiField,
  context: TimelineFieldContext,
  extra: UiProps = {},
): UiTimelineProps {
  const value = context.getFieldValue(field)
  const items = Array.isArray(extra.items)
    ? extra.items
    : Array.isArray(value)
      ? value
      : []
  return {
    items,
    keyField: extra.keyField,
    labelField: extra.labelField,
    contentField: extra.contentField,
    oppositeContentField: extra.oppositeContentField,
    iconField: extra.iconField,
    disabledField: extra.disabledField,
    cssClassField: extra.cssClassField,
    timeField: extra.timeField,
    startField: extra.startField,
    endField: extra.endField,
    groupingField: extra.groupingField,
    categoryField: extra.categoryField,
    progressField: extra.progressField,
    orientation: extra.orientation,
    align: extra.align,
    reverse: extra.reverse,
    timeDisplay: extra.timeDisplay,
    timeFormat: extra.timeFormat,
    locale: extra.locale,
    rtl: extra.rtl,
    persist: extra.persist,
    height: extra.height,
    range: extra.range,
    template: extra.template,
    onItemClick: extra.onItemClick,
    onSelectionChange: extra.onSelectionChange,
    onRangeChange: extra.onRangeChange,
    onReady: extra.onReady,
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...((extra.htmlAttributes as Record<string, string> | undefined) ?? {}),
    },
  } as UiTimelineProps
}

export function bindTimelineFactory(
  factory: { timeline?: (props: UiTimelineProps) => VNode },
  pluginOf: () => UiTimelinePlugin | null | undefined,
): void {
  if (typeof factory.timeline !== 'function') return
  const skin = factory.timeline.bind(factory)
  factory.timeline = (props) => {
    const plugin = pluginOf()
    return plugin ? plugin.timeline(props) : skin(props)
  }
}
