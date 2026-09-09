import { getCurrentInstance, h, type CSSProperties } from "vue";
import { BreadcrumbComponent } from "@syncfusion/ej2-vue-navigations";
import type { IconResolver, UiBreadcrumbProps } from "@mmda/vui"
import { htmlAttributesOf } from "@mmda/vui"

/** CSS `content` 需要带引号的字符串；JS 赋值必须写成 `"/"` 而不是 `/`。 */
function cssContentString(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

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
    separator = "/",
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
      : {};

  // EJ2 Vue 下 separator li 常为空；不用 separatorTemplate。
  // 可见分隔符由 CSS ::before + --mmda-breadcrumb-sep（须为引号字符串）画出。
  return h(BreadcrumbComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    items: ejItems,
    enableNavigation: false,
    cssClass: ["mmda-breadcrumb", className].flat().filter(Boolean).join(" "),
    style: {
      ...styleObj,
      "--mmda-breadcrumb-sep": cssContentString(separator),
    },
    itemClick: (args: any) => {
      const to = routeOfItem(args?.item);
      if (!to) return;
      void router?.push(to);
    },
  });
}
