/*
 * chrome 时间轴走 factory.timeline。vui 名是 timeline。
 * https://ej2.syncfusion.com/vue/documentation/timeline/vue3-getting-started
 */
import { h } from "vue";
import { TimelineComponent } from "@syncfusion/ej2-vue-layouts";
import type { UiTimelineItem, UiTimelineProps } from '@mmda/core'
import type { IconResolver } from '@mmda/vui'
import { htmlAttributesOf, noopTimelineController, timelineAlignOf, timelineAlignToEj2, timelineItemsOf, timelineListContentOf, timelineListOppositeOf, timelineModifierClasses, timelineOrientationOf, timelineOrientationToEj2 } from "@mmda/vui"

function itemsOf(items: UiTimelineItem[], resolveIcon?: IconResolver) {
  return items.map((item, index) => ({
    content: timelineListContentOf(item, index),
    oppositeContent: timelineListOppositeOf(item),
    dotCss: item.icon
      ? resolveIcon
        ? resolveIcon(item.icon)
        : item.icon
      : undefined,
    disabled: item.disabled,
    cssClass: item.cssClass,
  }));
}

export function createTimeline(
  props: UiTimelineProps,
  resolveIcon?: IconResolver,
) {
  const {
    items: _items,
    keyField: _keyField,
    labelField: _labelField,
    contentField: _contentField,
    oppositeContentField: _oppositeContentField,
    iconField: _iconField,
    disabledField: _disabledField,
    cssClassField: _cssClassField,
    timeField: _timeField,
    startField: _startField,
    endField: _endField,
    groupingField: _groupingField,
    categoryField: _categoryField,
    progressField: _progressField,
    orientation: _orientation,
    align: _align,
    reverse,
    timeDisplay: _timeDisplay,
    timeFormat: _timeFormat,
    locale,
    rtl,
    persist,
    height: _height,
    range: _range,
    template,
    onItemClick: _onItemClick,
    onSelectionChange: _onSelectionChange,
    onRangeChange: _onRangeChange,
    onReady,
    class: _className,
    htmlAttributes,
    ...rest
  } = props;

  onReady?.(noopTimelineController);

  const cssClass = timelineModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  return h(TimelineComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    items: itemsOf(timelineItemsOf(props), resolveIcon),
    orientation: timelineOrientationToEj2(timelineOrientationOf(props)),
    align: timelineAlignToEj2(timelineAlignOf(props)),
    reverse: Boolean(reverse),
    locale,
    enableRtl: Boolean(rtl),
    enablePersistence: Boolean(persist),
    template,
    cssClass,
  });
}
