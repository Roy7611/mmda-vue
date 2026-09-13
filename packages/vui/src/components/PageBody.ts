import { Comment, defineComponent, h, ref, watch } from "vue";
import { uiCssClass } from "@mmda/core";
import { translateMessage } from "../i18n/i18n";
import { useCompactViewport } from "../composables/useCompactViewport";

/**
 * Detail page body (cards): column flex — optional banner, then content row.
 * Content wraps main | summary (2:1); summary collapses to free width.
 * Toggle is fixed on the viewport right edge at mid-height.
 * Footer is a sibling under `.mmda-page`, not inside this body.
 */
export const PageBody = defineComponent({
  name: "PageBody",
  props: {
    hasSummary: { type: Boolean, default: false },
    /** Initial summary open state */
    summaryExpanded: { type: Boolean, default: true },
  },
  setup(props, { slots }) {
    const summaryOpen = ref(props.summaryExpanded !== false);
    const compact = useCompactViewport();

    watch(
      compact,
      (isCompact) => {
        if (isCompact) summaryOpen.value = false;
      },
      { immediate: true },
    );

    const toggleSummary = () => {
      summaryOpen.value = !summaryOpen.value;
    };

    return () => {
      const banner = slots.banner?.();
      // 空 / Comment / 纯空白 vnode 都不占 banner 行，避免无消息也留一条空隙
      const bannerNodes = (Array.isArray(banner) ? banner : [banner]).filter(
        (node) =>
          node != null &&
          typeof node === "object" &&
          (node as { type?: unknown }).type !== Comment &&
          (node as { children?: unknown }).children !== "",
      );
      const hasBanner = bannerNodes.length > 0;
      return h(
        "div",
        {
          class: [
            uiCssClass("page", "body"),
            props.hasSummary &&
              uiCssClass("page", "body", "with-summary"),
            hasBanner && uiCssClass("page", "body", "with-banner"),
            compact.value && uiCssClass("page", "body", "compact"),
            props.hasSummary &&
              !summaryOpen.value &&
              uiCssClass("page", "body", "collapsed"),
          ],
        },
        [
          hasBanner
            ? h("div", { class: uiCssClass("page", "banner") }, bannerNodes)
            : null,
          h("div", { class: uiCssClass("page", "content") }, [
            h(
              "main",
              {
                class: [
                  uiCssClass("section"),
                  uiCssClass("section", undefined, "main"),
                ],
              },
              [slots.primary?.(), slots.tails?.()],
            ),
            props.hasSummary
              ? h(
                  "aside",
                  {
                    class: [
                      uiCssClass("section"),
                      uiCssClass("section", undefined, "summary"),
                    ],
                    "aria-hidden": !summaryOpen.value,
                  },
                  [
                    h(
                      "div",
                      { class: uiCssClass("section", "body") },
                      slots.summary?.(),
                    ),
                  ],
                )
              : null,
          ]),
          props.hasSummary
            ? h(
                "button",
                {
                  type: "button",
                  class: uiCssClass("section", "toggle"),
                  title: summaryOpen.value
                    ? translateMessage("layout.collapseSummary")
                    : translateMessage("layout.expandSummary"),
                  "aria-label": summaryOpen.value
                    ? translateMessage("layout.collapseSummaryBar")
                    : translateMessage("layout.expandSummaryBar"),
                  "aria-expanded": summaryOpen.value,
                  onClick: toggleSummary,
                },
                [
                  h("span", {
                    class: uiCssClass("section", "toggle-icon"),
                    "aria-hidden": "true",
                  }),
                ],
              )
            : null,
        ],
      );
    };
  },
});
