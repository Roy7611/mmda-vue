import { defineComponent, h, ref } from "vue";
import Card from "primevue/card";

/**
 * PrimeVue Card group shell: body stays mounted; collapsed = header height only.
 *
 * Classes mirror Syncfusion shell (without e-*):
 *   .p-card.mmda-group.master|sub.primary|secondary
 *     .mmda-group-header
 *       [title] [actions] [toggle]
 *     .e-collapse > .e-collapse-inner > .mmda-group-body
 *     .mmda-group-footer (optional)
 */
export const PrimeGroupCard = defineComponent({
  name: "PrimeGroupCard",
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    expanded: { type: Boolean, default: true },
    toggleable: { type: Boolean, default: true },
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

    return () => {
      const slotArgs = { title: props.title, open: open.value };
      const footer = slots.footer?.(slotArgs);
      const actions = slots.actions?.(slotArgs);
      return h(
        Card,
        {
          ...attrs,
          class: [
            attrs.class,
            open.value ? "is-expanded" : "is-collapsed",
          ],
        },
        {
          header: () =>
            h(
              "div",
              {
                class: "mmda-group-header",
                role: props.toggleable ? "button" : undefined,
                tabindex: props.toggleable ? 0 : undefined,
                "aria-expanded": open.value,
                onClick: props.toggleable ? toggle : undefined,
                onKeydown: props.toggleable ? onKeydown : undefined,
              },
              [
                h("h2", { class: "mmda-group-title" }, props.title),
                actions
                  ? h(
                      "div",
                      {
                        class: "mmda-group-actions",
                        onClick: (e: MouseEvent) => e.stopPropagation(),
                        onKeydown: (e: KeyboardEvent) => e.stopPropagation(),
                      },
                      actions,
                    )
                  : null,
                props.toggleable
                  ? h("span", {
                      class: ["mmda-group-toggle", "pi", "pi-chevron-down"],
                      "aria-hidden": "true",
                    })
                  : null,
              ],
            ),
          content: () =>
            h("div", { class: "e-collapse" }, [
              h(
                "div",
                { class: "e-collapse-inner" },
                slots.default?.(slotArgs),
              ),
            ]),
          footer: footer
            ? () => h("div", { class: "mmda-group-footer" }, footer)
            : undefined,
        },
      );
    };
  },
});
