/*
 * chrome 时间轴走 factory.timeline。vui 名是 timeline。
 * Naive NTimeline：horizontal / itemPlacement；time 走对侧时间。
 *
 * 本工厂只消费列表侧入参（core `UiTimelineProps`）；事件、控制器、可见范围
 * 归 Tempis 契约（`buildTempisTimeline`），这里一个都不透传。
 */
import { h } from "vue";
import { NTimeline, NTimelineItem } from "naive-ui";
import type { UiTimelineProps } from '@mmda/core'
import type { IconResolver } from '@mmda/vui'
import { timelineAlignOf, timelineItemsOf, timelineListContentOf, timelineListOppositeOf, timelineModifierClasses, timelineOrientationOf } from "@mmda/vui"
import { uiRenderProps } from "@mmda/core"

export function createTimeline(
  props: UiTimelineProps,
  resolveIcon?: IconResolver,
) {
  let items = timelineItemsOf(props);
  if (props.reverse) items = [...items].reverse();
  const align = timelineAlignOf(props);

  return h(
    NTimeline,
    {
      ...uiRenderProps(props).attributes,
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
