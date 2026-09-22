/*
 * chrome 时间轴走 factory.timeline。vui 名是 timeline。
 * https://ej2.syncfusion.com/vue/documentation/timeline/vue3-getting-started
 *
 * 本工厂只消费列表侧入参（core `UiTimelineProps`）；事件、控制器、可见范围
 * 归 Tempis 契约（`buildTempisTimeline`），这里一个都不透传。
 */
import { h } from "vue";
import { TimelineComponent } from "@syncfusion/ej2-vue-layouts";
import type { UiTimelineItem, UiTimelineProps } from '@mmda/core'
import type { IconResolver } from '@mmda/vui'
import { timelineAlignOf, timelineAlignToEj2, timelineItemsOf, timelineListContentOf, timelineListOppositeOf, timelineModifierClasses, timelineOrientationOf, timelineOrientationToEj2 } from "@mmda/vui"
import { uiRenderProps } from "@mmda/core"

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
  const cssClass = timelineModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  return h(TimelineComponent as any, {
    ...uiRenderProps(props).attributes,
    items: itemsOf(timelineItemsOf(props), resolveIcon),
    orientation: timelineOrientationToEj2(timelineOrientationOf(props)),
    align: timelineAlignToEj2(timelineAlignOf(props)),
    reverse: Boolean(props.reverse),
    locale: props.locale,
    enableRtl: Boolean(props.rtl),
    enablePersistence: Boolean(props.persist),
    template: props.template,
    cssClass,
  });
}
