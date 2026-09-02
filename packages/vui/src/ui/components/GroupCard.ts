import { defineComponent, h, ref, type PropType } from "vue";

/**
 * Collapsible group shell only — field/table layout lives in
 * `.mmda-group-body` (see AbstractUiBuilder.wrapGroupContent).
 *
 * Structure:
 *   .mmda-group.master|sub.primary|secondary
 *     .mmda-group-header
 *       [header/title] [actions] [toggle]
 *     .e-collapse
 *       .e-collapse-inner
 *         .mmda-group-body  (slot default)
 *     .mmda-group-footer     (slot footer, optional)
 */
export const MmdaGroupCard = defineComponent({
  name: "MmdaGroupCard",
  inheritAttrs: false,
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
    footerClass: {
      type: [String, Array, Object] as PropType<unknown>,
      default: undefined,
    },
    collapseClass: {
      type: [String, Array, Object] as PropType<unknown>,
      default: undefined,
    },
    /** Toggle icon classes (e.g. `e-icons e-chevron-down`); rotates when collapsed */
    toggleIcon: { type: String, default: undefined },
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
        props.tag,
        {
          ...attrs,
          class: [
            attrs.class,
            open.value ? "is-expanded" : "is-collapsed",
          ],
        },
        [
          h(
            "header",
            {
              class: ["mmda-group-header", props.headerClass],
              role: props.toggleable ? "button" : undefined,
              tabindex: props.toggleable ? 0 : undefined,
              "aria-expanded": open.value,
              onClick: props.toggleable ? toggle : undefined,
              onKeydown: props.toggleable ? onKeydown : undefined,
            },
            [
              slots.header?.(slotArgs) ??
                h("h2", { class: "mmda-group-title" }, props.title),
              actions
                ? h(
                    "div",
                    {
                      class: "mmda-group-actions",
                      // 避免点工具栏时触发展开/折叠
                      onClick: (e: MouseEvent) => e.stopPropagation(),
                      onKeydown: (e: KeyboardEvent) => e.stopPropagation(),
                    },
                    actions,
                  )
                : null,
              props.toggleable
                ? h("span", {
                    class: [
                      "mmda-group-toggle",
                      props.toggleIcon,
                      !props.toggleIcon && "mmda-group-toggle--css",
                    ],
                    "aria-hidden": "true",
                  })
                : null,
            ],
          ),
          h("div", { class: ["e-collapse", props.collapseClass] }, [
            h(
              "div",
              { class: "e-collapse-inner" },
              slots.default?.(slotArgs),
            ),
          ]),
          footer
            ? h(
                "footer",
                { class: ["mmda-group-footer", props.footerClass] },
                footer,
              )
            : null,
        ],
      );
    };
  },
});
