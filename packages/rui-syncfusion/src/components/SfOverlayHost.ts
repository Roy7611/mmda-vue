import { createElement, type ReactNode } from "react";

export function SfOverlayHost(props: { children?: ReactNode }): ReactNode {
  return createElement(
    "div",
    { className: "mmda-overlay-host" },
    props.children,
  );
}
