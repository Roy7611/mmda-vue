import { defineComponent, h, ref, watch } from "vue";
import { uiCssClass } from "@mmda/core";
import { translateMessage } from "../i18n/i18n";
import { useCompactViewport } from "../composables/useCompactViewport";

/**
 * Detail page body (cards): content row wraps main | summary (2:1);
 * summary collapses to free width. Toggle is fixed on the viewport right
 * edge at mid-height. Banner / footer are siblings under `.mmda-page`,
 * assembled by core `AbstractUiLayout.layoutPage`.
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
      return h(
        "div",
        {
          class: [
            uiCssClass("page", "body"),
            props.hasSummary &&
              uiCssClass("page", "body", "with-summary"),
            compact.value && uiCssClass("page", "body", "compact"),
            props.hasSummary &&
              !summaryOpen.value &&
              uiCssClass("page", "body", "collapsed"),
          ],
        },
        [
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
