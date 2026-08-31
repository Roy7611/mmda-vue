import { defineComponent, h, ref } from "vue";
import Card from "primevue/card";

/**
 * PrimeVue Card group shell: body stays mounted; collapsed = header height only.
 */
export const PrimeGroupCard = defineComponent({
  name: "PrimeGroupCard",
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

    return () =>
      h(
        Card,
        {
          ...attrs,
          class: [
            attrs.class,
            "mmda-group-card",
            open.value ? "is-expanded" : "is-collapsed",
          ],
        },
        {
          header: () =>
            h(
              "div",
              {
                class: "mmda-group__header",
                role: props.toggleable ? "button" : undefined,
                tabindex: props.toggleable ? 0 : undefined,
                "aria-expanded": open.value,
                onClick: props.toggleable ? toggle : undefined,
                onKeydown: props.toggleable ? onKeydown : undefined,
              },
              [
                h("h2", { class: "mmda-group__title" }, props.title),
                props.toggleable
                  ? h("span", {
                      class: ["mmda-group__toggle", "pi", "pi-chevron-down"],
                      "aria-hidden": "true",
                    })
                  : null,
              ],
            ),
          content: () =>
            h("div", { class: "mmda-group__collapse" }, [
              h(
                "div",
                { class: "mmda-group__collapse-inner" },
                slots.default?.(),
              ),
            ]),
        },
      );
  },
});
