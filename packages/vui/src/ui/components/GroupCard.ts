import { defineComponent, h, ref, type PropType } from "vue";

/**
 * Collapsible group shell: header + body, chevron toggle (matches legacy Panel).
 * Initial open state comes from MetaUiGroup.expanded.
 */
export const MmdaGroupCard = defineComponent({
  name: "MmdaGroupCard",
  props: {
    title: { type: String, required: true },
    expanded: { type: Boolean, default: true },
    toggleable: { type: Boolean, default: true },
    tag: { type: String as PropType<string>, default: "article" },
    headerClass: {
      type: [String, Array, Object] as PropType<unknown>,
      default: undefined,
    },
    bodyClass: {
      type: [String, Array, Object] as PropType<unknown>,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    const open = ref(props.expanded !== false);

    const toggle = () => {
      if (!props.toggleable) return;
      open.value = !open.value;
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (!props.toggleable) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    };

    return () =>
      h(
        props.tag,
        {
          ...attrs,
          class: [
            attrs.class,
            "mmda-group-card",
            open.value ? "is-expanded" : "is-collapsed",
          ],
        },
        [
          h(
            "header",
            {
              class: ["mmda-group__header", props.headerClass],
              role: props.toggleable ? "button" : undefined,
              tabindex: props.toggleable ? 0 : undefined,
              "aria-expanded": open.value,
              onClick: props.toggleable ? toggle : undefined,
              onKeydown: props.toggleable ? onKeydown : undefined,
            },
            [
              slots.header?.({ title: props.title, open: open.value }) ??
                h("h2", { class: "mmda-group__title" }, props.title),
              props.toggleable
                ? h("i", {
                    class: [
                      "fa-solid",
                      open.value ? "fa-chevron-down" : "fa-chevron-right",
                      "mmda-group__toggle",
                    ],
                    "aria-hidden": "true",
                  })
                : null,
            ],
          ),
          open.value
            ? h(
                "div",
                { class: ["mmda-group__body", props.bodyClass] },
                slots.default?.(),
              )
            : null,
        ],
      );
  },
});
