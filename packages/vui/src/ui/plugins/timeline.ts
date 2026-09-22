/*
 * 时间轴（列表档）的 vui 侧薄封装。
 *
 * 契约在 core：列表档 `ui/plugins/timeline.ts`（chrome `factory.timeline`），
 * 二维画布档 `ui/plugins/tempis_timeline.ts`（`buildTempisTimeline` 插件）。
 * 这里把两档一起再导出，插件包（`vuix-tempis-timeline`）从 `@mmda/vui` 取即可。
 */
import type { MetaUiField, UiTimelineProps } from '@mmda/core'

export type {
  UiTimelineAlign,
  UiTimelineFieldOf,
  UiTimelineItem,
  UiTimelineProps,
  UiTimelineTimeDisplay,
} from '@mmda/core'
export {
  timelineAlignOf,
  timelineAlignToEj2,
  timelineBoolOf,
  timelineFieldValueOf,
  timelineItemsOf,
  timelineKeyOf,
  timelineListContentOf,
  timelineListOppositeOf,
  timelineModifierClasses,
  timelineOrientationOf,
  timelineOrientationToEj2,
  timelineSqlOf,
  timelineStringOf,
  timelineTimeTextOf,
} from '@mmda/core'
export type {
  UiTempisAccessibility,
  UiTempisBand,
  UiTempisBandStyle,
  UiTempisCategory,
  UiTempisDependency,
  UiTempisDependencyStyle,
  UiTempisEasing,
  UiTempisFocusOptions,
  UiTempisFont,
  UiTempisGrouping,
  UiTempisItemStyle,
  UiTempisLegend,
  UiTempisLineStyle,
  UiTempisMinimap,
  UiTempisRange,
  UiTempisRangeUnit,
  UiTempisRangeUnitFormats,
  UiTempisRangeZoom,
  UiTempisScrollbar,
  UiTempisSelectionChange,
  UiTempisSelectionMode,
  UiTempisStackMode,
  UiTempisTimelineController,
  UiTempisTimelineItem,
  UiTempisTimelineProps,
  UiTempisTooltip,
  UiTempisVerticalFill,
} from '@mmda/core'
export {
  noopTempisTimelineController,
  TEMPIS_TIMELINE_PLUGIN_NOT_INSTALLED,
  tempisTimelineItemsOf,
} from '@mmda/core'

export type TimelineFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  isFieldReadonly?: (field: MetaUiField | string) => boolean
}

export function timelinePropsFromField(
  field: MetaUiField,
  context: TimelineFieldContext
): UiTimelineProps {
  const value = context.getFieldValue(field)
  const items = Array.isArray(value) ? value : []
  return {
    items,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...({}),
    },
  } as UiTimelineProps
}
