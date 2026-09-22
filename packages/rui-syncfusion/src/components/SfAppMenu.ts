import { createElement, useState, type ReactNode } from "react";

export interface SfAppMenuItem {
  moduleCode?: string;
  label?: string;
  icon?: string;
  href?: string;
  items?: SfAppMenuItem[];
  children?: SfAppMenuItem[];
}

function renderModuleItems(
  items: SfAppMenuItem[],
  onNavigate?: (item: SfAppMenuItem) => void,
): ReactNode {
  return items.map((item, index) => {
    const children = item.items ?? item.children;
    return createElement(
      "div",
      { className: "mmda-app-menu-group", key: item.moduleCode ?? index },
      createElement(
        "button",
        {
          type: "button",
          className: "mmda-app-menu-group-button",
          onClick: () => onNavigate?.(item),
        },
        item.icon ? createElement("i", { className: item.icon }) : null,
        item.label,
      ),
      children?.length
        ? createElement(
            "div",
            { className: "mmda-app-menu-group-items" },
            renderModuleItems(children, onNavigate),
          )
        : null,
    );
  });
}

export function SfAppSideMenu(props: {
  items?: SfAppMenuItem[];
  onNavigate?: (item: SfAppMenuItem) => void;
  children?: ReactNode;
}): ReactNode {
  const [collapsed, setCollapsed] = useState(false);
  return createElement(
    "nav",
    { className: "mmda-app-menu" },
    createElement(
      "button",
      {
        type: "button",
        className: "mmda-app-menu-toggle",
        onClick: () => setCollapsed((value) => !value),
      },
      collapsed ? "展开" : "收起",
    ),
    collapsed ? null : renderModuleItems(props.items ?? [], props.onNavigate),
    props.children,
  );
}

export const SfAppMenu = SfAppSideMenu;
