import { defineComponent, h, ref } from "vue";
import { translateMessage } from "../../i18n/i18n";

/**
 * Detail page body: left/right regions in one root (page scrolls as one).
 * Left main stacks primary then tails; right summary collapses to free width.
 * Toggle is sticky on the content edge so it stays at a fixed height.
 */
export const MmdaPageRegions = defineComponent({
  name: "MmdaPageRegions",
  props: {
    hasSummary: { type: Boolean, default: false },
    /** Initial summary open state */
    summaryExpanded: { type: Boolean, default: true },
  },
  setup(props, { slots }) {
    const summaryOpen = ref(props.summaryExpanded !== false);

    const toggleSummary = () => {
      summaryOpen.value = !summaryOpen.value;
    };

    return () =>
      h(
        "div",
        {
          class: [
            "mmda-page-regions",
            props.hasSummary && "mmda-page-regions--with-summary",
            props.hasSummary &&
              (summaryOpen.value ? "is-summary-open" : "is-summary-collapsed"),
          ],
        },
        [
          h("main", { class: "mmda-page-main" }, [
            slots.primary?.(),
            slots.tails?.(),
          ]),
          props.hasSummary
            ? h(
                "button",
                {
                  type: "button",
                  class: "mmda-page-summary-toggle",
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
                    class: "mmda-page-summary-toggle-icon",
                    "aria-hidden": "true",
                  }),
                ],
              )
            : null,
          props.hasSummary
            ? h(
                "aside",
                {
                  class: "mmda-page-summary",
                  "aria-hidden": !summaryOpen.value,
                },
                [
                  h(
                    "div",
                    { class: "mmda-page-summary-body" },
                    slots.summary?.(),
                  ),
                ],
              )
            : null,
          slots.footer?.()
            ? h("footer", { class: "mmda-page-footer" }, slots.footer())
            : null,
        ],
      );
  },
});
