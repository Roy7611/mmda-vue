import { getCurrentInstance, h, type CSSProperties } from "vue";
import { BreadcrumbComponent } from "@syncfusion/ej2-vue-navigations";
import type { IconResolver, UiBreadcrumbProps } from "@mmda/vui"
import { htmlAttributesOf } from "@mmda/vui"

function routeOfItem(item: any): string | undefined {
  const raw = item?.url ?? item?.properties?.url;
  if (raw == null) return undefined;
  const to = String(raw).trim();
  if (!to || to === "#") return undefined;
  return to;
}

export function createBreadcrumb(
  props: UiBreadcrumbProps,
  resolveIcon?: IconResolver,
) {
  const {
    items = [],
    separator,
    class: className,
    htmlAttributes,
    style,
    ...rest
  } = props as UiBreadcrumbProps & { style?: CSSProperties | string };

  const ejItems = items.map((item, index) => ({
    text: item.label,
    id: item.key ?? `bc-${index}`,
    iconCss: item.icon
      ? resolveIcon
        ? resolveIcon(item.icon)
        : item.icon
      : undefined,
    // SPA: store route in url; navigation handled in itemClick
    url: item.to || undefined,
  }));

  // 必须在 render/setup 时抓住 router：itemClick 触发时 getCurrentInstance() 已是 null
  const instance = getCurrentInstance();
  const router = instance?.appContext.config.globalProperties.$router as
    | { push: (to: string) => unknown }
    | undefined;

  const styleObj =
    style && typeof style === "object" && !Array.isArray(style)
      ? { ...style }
      : undefined;

  // 默认 "/" 交给 EJ2（未设 separatorTemplate 时内部就是 "/"）。
  // 自定义分隔符才传 separatorTemplate；不要再用 CSS ::before，否则会叠成两条。
  const customSep =
    separator != null && separator !== "" && separator !== "/"
      ? separator
      : undefined;

  return h(BreadcrumbComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    items: ejItems,
    enableNavigation: false,
    ...(customSep != null ? { separatorTemplate: () => customSep } : {}),
    cssClass: ["mmda-breadcrumb", className].flat().filter(Boolean).join(" "),
    ...(styleObj ? { style: styleObj } : {}),
    itemClick: (args: any) => {
      const to = routeOfItem(args?.item);
      if (!to) return;
      void router?.push(to);
    },
  });
}
