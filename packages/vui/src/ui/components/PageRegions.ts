import { defineComponent, h, ref } from "vue";

/**
 * Detail page regions: left main (primary + tails stacked) | right summary.
 * Summary can collapse so main uses full width.
 * Toggle is a sibling of the summary (anchored to regions) so its Y stays fixed while the panel slides.
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
              (summaryOpen.value
                ? "is-summary-open"
                : "is-summary-collapsed"),
          ],
        },
        [
          h("div", { class: "mmda-page-main" }, [
            h("div", { class: "mmda-page-primary" }, slots.primary?.()),
            slots.tails?.()
              ? h("div", { class: "mmda-page-tails" }, slots.tails())
              : null,
          ]),
          props.hasSummary
            ? h(
                "button",
                {
                  type: "button",
                  class: "mmda-page-summary__toggle",
                  title: summaryOpen.value ? "收起右侧" : "展开右侧",
                  "aria-label": summaryOpen.value
                    ? "收起右侧栏"
                    : "展开右侧栏",
                  "aria-expanded": summaryOpen.value,
                  onClick: toggleSummary,
                },
                [
                  h("span", {
                    class: "mmda-page-summary__toggle-icon",
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
                    { class: "mmda-page-summary__body" },
                    slots.summary?.(),
                  ),
                ],
              )
            : null,
        ],
      );
  },
});
