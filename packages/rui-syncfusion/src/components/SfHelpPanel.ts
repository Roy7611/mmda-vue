import { createElement, type ReactNode } from "react";

export interface SfHelpPanelItem {
  icon?: string;
  title: string;
  content: string;
}

export function SfHelpPanel(props: {
  items?: SfHelpPanelItem[];
  children?: ReactNode;
}): ReactNode {
  const items = props.items ?? [];
  return createElement(
    "div",
    { className: "mmda-help-panel" },
    items.map((item) =>
      createElement(
        "div",
        { className: "mmda-help-item", key: item.title },
        item.icon
          ? createElement("i", { className: item.icon, "aria-hidden": true })
          : null,
        createElement("div", { className: "mmda-help-item-title" }, item.title),
        createElement(
          "div",
          { className: "mmda-help-item-content" },
          item.content,
        ),
      ),
    ),
    props.children,
  );
}
