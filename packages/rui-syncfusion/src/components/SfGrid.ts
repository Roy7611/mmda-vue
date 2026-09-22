import { createElement, type ReactNode } from "react";

export function SfGrid(props: {
  className?: string;
  children?: ReactNode;
}): ReactNode {
  return createElement(
    "div",
    { className: `mmda-grid ${props.className ?? ""}` },
    props.children,
  );
}
