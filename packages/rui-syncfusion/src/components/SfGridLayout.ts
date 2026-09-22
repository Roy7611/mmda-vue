import { createElement, type ReactNode } from "react";

export function SfGridLayout(props: {
  className?: string;
  children?: ReactNode;
}): ReactNode {
  return createElement(
    "div",
    { className: `mmda-grid-layout ${props.className ?? ""}` },
    props.children,
  );
}
