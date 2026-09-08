import { h } from "vue";
import { RouterLink } from "vue-router";
import Breadcrumb from "primevue/breadcrumb";
import type { IconResolver, UiBreadcrumbProps } from "@mmda/vui";
import { htmlAttributesOf } from "@mmda/vui";

export function createBreadcrumb(
  props: UiBreadcrumbProps,
  resolveIcon?: IconResolver,
) {
  const {
    items = [],
    separator: _separator,
    class: className,
    htmlAttributes,
    ...rest
  } = props;

  const model = items.map((item, index) => ({
    key: item.key ?? `bc-${index}`,
    label: item.label,
    icon: item.icon
      ? resolveIcon
        ? resolveIcon(item.icon)
        : item.icon
      : undefined,
    to: item.to,
    leaf: !item.to,
  }));

  return h(
    Breadcrumb,
    {
      ...rest,
      ...htmlAttributesOf(props),
      model,
      class: ["mmda-breadcrumb", className],
    },
    {
      item: ({ item }: { item: (typeof model)[number] }) =>
        item.leaf || !item.to
          ? h("span", { class: "mmda-breadcrumb__item" }, [
              item.icon
                ? h("i", {
                    class: [item.icon, "mmda-breadcrumb__icon"],
                    "aria-hidden": "true",
                  })
                : null,
              item.label,
            ])
          : h(
              RouterLink as any,
              { to: item.to, class: "mmda-breadcrumb__link" },
              () => [
                item.icon
                  ? h("i", {
                      class: [item.icon, "mmda-breadcrumb__icon"],
                      "aria-hidden": "true",
                    })
                  : null,
                item.label,
              ],
            ),
    },
  );
}
