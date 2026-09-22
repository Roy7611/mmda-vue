import { createElement, type ReactElement, type ReactNode } from "react";
import { uiClassName, uiRenderProps, type UiProps } from "@mmda/core";

/** 合并 UI 类名：厂商类 + 控件自算 modifier + 调用方 `class`。 */
export function joinClass(...parts: unknown[]): string {
  return uiClassName(...parts);
}

/** EJ2 组件的 `cssClass`：基础类 / modifier 与调用方 `class` 归一处。 */
export function sfCssClass(props?: UiProps, ...extra: unknown[]): string {
  return uiClassName(extra, props?.class);
}

/** 原生 DOM 属性：压平 `htmlAttributes`，只译 `class → className` / `for → htmlFor`。 */
export function nativeDomProps(props: UiProps = {}): Record<string, unknown> {
  const std = uiRenderProps(props);
  const out: Record<string, unknown> = { ...std.attributes };
  const className = uiClassName(std.props.class);
  if (className) out.className = className;
  if (std.props.style != null) out.style = std.props.style;
  if (std.props.for != null) out.htmlFor = std.props.for;
  if (std.props.role != null) out.role = std.props.role;
  return out;
}

/** EJ2 组件的 `htmlAttributes` 袋。 */
export function sfHtmlAttributes(props: UiProps = {}): Record<string, unknown> {
  return { ...uiRenderProps(props).attributes };
}

/** `createElement` 简写，供工厂内部拼 HTML 壳。 */
export function el(
  tag: string,
  props: Record<string, unknown> = {},
  ...children: ReactNode[]
): ReactElement {
  return createElement(tag, props, ...children);
}
