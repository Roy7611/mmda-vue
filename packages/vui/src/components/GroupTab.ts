import { uiCssClass } from "@mmda/core";
import { defineComponent, h, type PropType } from "vue";

/**
 * Tab pane group shell — no title mirror of the tab header, no collapse.
 *
 * Structure:
 *   article.mmda-group.mmda-group--tab
 *     header.mmda-group__header?   (caption and/or actions)
 *       .mmda-group__caption
 *       .mmda-group__actions
 *     .mmda-group__body
 *     footer.mmda-group__footer?
 */
export const GroupTab = defineComponent({
  name: "GroupTab",
  inheritAttrs: false,
  props: {
    /** Optional in-pane caption (NOT groupLabel — tab already shows that) */
    caption: { type: String, default: undefined },
    tag: { type: String as PropType<string>, default: "article" },
    headerClass: {
      type: [String, Array, Object] as PropType<unknown>,
      default: undefined,
    },
    bodyClass: {
      type: [String, Array, Object] as PropType<unknown>,
      default: undefined,
    },
    footerClass: {
      type: [String, Array, Object] as PropType<unknown>,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const caption =
        slots.caption?.() ??
        (props.caption
          ? h("div", { class: uiCssClass("group", "caption") }, props.caption)
          : null);
      const actions = slots.actions?.();
      const footer = slots.footer?.();
      const hasHeader = Boolean(caption || actions);

      return h(
        props.tag,
        {
          ...attrs,
          class: [attrs.class, uiCssClass("group", undefined, "tab")],
        },
        [
          hasHeader
            ? h(
                "header",
                {
                  class: [uiCssClass("group", "header"), props.headerClass],
                },
                [
                  caption,
                  actions
                    ? h(
                        "div",
                        { class: uiCssClass("group", "actions") },
                        actions,
                      )
                    : null,
                ],
              )
            : null,
          h(
            "div",
            {
              class: [uiCssClass("group", "body"), props.bodyClass],
            },
            slots.default?.(),
          ),
          footer
            ? h(
                "footer",
                {
                  class: [uiCssClass("group", "footer"), props.footerClass],
                },
                footer,
              )
            : null,
        ],
      );
    };
  },
});
