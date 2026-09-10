import { defineComponent, h, ref, watch } from "vue";
import { uiCssClass } from "@mmda/core";
import { translateMessage } from "../i18n/i18n";
import { useCompactViewport } from "../composables/useCompactViewport";

/**
 * Detail page body: left/right regions in one root (page scrolls as one).
 * Optional full-width banner sits above main + summary and pushes both down.
 * Left main stacks primary then tails; right summary collapses to free width.
 * Toggle is sticky on the content edge at viewport mid-height (like Splitter collapse).
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
      const hasBanner = Array.isArray(banner)
        ? banner.some((node) => node != null)
        : banner != null;
      return h(
        "div",
        {
          class: [
            uiCssClass("page-body"),
            props.hasSummary && uiCssClass("page-body", undefined, "with-summary"),
            hasBanner && uiCssClass("page-body", undefined, "with-banner"),
            compact.value && uiCssClass("page-body", undefined, "compact"),
            props.hasSummary &&
              (summaryOpen.value ? "is-summary-open" : "is-summary-collapsed"),
          ],
        },
        [
          hasBanner
            ? h(
                "div",
                { class: uiCssClass("page-banner") },
                banner,
              )
            : null,
          h("main", { class: uiCssClass("page-main") }, [
            slots.primary?.(),
            slots.tails?.(),
          ]),
          props.hasSummary
            ? h(
                "button",
                {
                  type: "button",
                  class: uiCssClass("page-summary-toggle"),
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
                    class: uiCssClass("page-summary-toggle-icon"),
                    "aria-hidden": "true",
                  }),
                ],
              )
            : null,
          props.hasSummary
            ? h(
                "aside",
                {
                  class: uiCssClass("page-summary"),
                  "aria-hidden": !summaryOpen.value,
                },
                [
                  h(
                    "div",
                    { class: uiCssClass("page-summary-body") },
                    slots.summary?.(),
                  ),
                ],
              )
            : null,
          slots.footer?.()
            ? h("footer", { class: uiCssClass("page-footer") }, slots.footer())
            : null,
        ],
      );
    };
  },
});
