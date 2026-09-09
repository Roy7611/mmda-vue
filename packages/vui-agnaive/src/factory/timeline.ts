/*
 * chrome 时间轴走 factory.timeline。vui 名是 timeline。
 * Naive NTimeline：horizontal / itemPlacement；time 走对侧时间。
 */
import { h } from "vue";
import { NTimeline, NTimelineItem } from "naive-ui";
import type { UiTimelineProps } from '@mmda/core'
import type { IconResolver } from '@mmda/vui'
import { htmlAttributesOf, noopTimelineController, timelineAlignOf, timelineItemsOf, timelineListContentOf, timelineListOppositeOf, timelineModifierClasses, timelineOrientationOf } from "@mmda/vui"

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
    locale: _locale,
    rtl: _rtl,
    persist: _persist,
    height: _height,
    range: _range,
    template: _template,
    onItemClick: _onItemClick,
    onSelectionChange: _onSelectionChange,
    onRangeChange: _onRangeChange,
    onReady,
    class: _className,
    htmlAttributes,
    ...rest
  } = props;

  onReady?.(noopTimelineController);

  let items = timelineItemsOf(props);
  if (reverse) items = [...items].reverse();
  const align = timelineAlignOf(props);

  return h(
    NTimeline,
    {
      ...rest,
      ...htmlAttributesOf(props),
      horizontal: timelineOrientationOf(props) === "horizontal",
      itemPlacement: align === "before" ? "left" : "right",
      class: timelineModifierClasses(props),
    },
    {
      default: () =>
        items.map((item, index) =>
          h(
            NTimelineItem,
            {
              key: item.key ?? `step-${index}`,
              title: item.label ?? timelineListContentOf(item, index),
              content:
                item.content && item.label && item.content !== item.label
                  ? item.content
                  : undefined,
              time: timelineListOppositeOf(item),
              disabled: item.disabled,
            },
            item.icon
              ? {
                  icon: () =>
                    h("i", {
                      class: resolveIcon ? resolveIcon(item.icon!) : item.icon,
                      "aria-hidden": "true",
                    }),
                }
              : undefined,
          ),
        ),
    },
  );
}
