import { createElement, useState, type ReactNode } from "react";

export type DropupPlacement = "top" | "top-end";

export interface DropupMenuItem {
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

export function SfDropupMenuButton(props: {
  items?: DropupMenuItem[];
  placement?: DropupPlacement;
  label?: string;
  icon?: string;
  onSelect?: (item: DropupMenuItem) => void;
  children?: ReactNode;
}): ReactNode {
  const [open, setOpen] = useState(false);
  return createElement(
    "div",
    { className: "mmda-dropup" },
    createElement(
      "button",
      {
        type: "button",
        className: "mmda-dropup-button",
        onClick: () => setOpen((value) => !value),
      },
      props.icon ? createElement("i", { className: props.icon }) : null,
      props.label,
    ),
    open
      ? createElement(
          "div",
          { className: "mmda-dropup-menu" },
          (props.items ?? []).map((item) =>
            createElement(
              "button",
              {
                key: item.key,
                type: "button",
                disabled: item.disabled,
                onClick: () => {
                  setOpen(false);
                  props.onSelect?.(item);
                },
              },
              item.icon ? createElement("i", { className: item.icon }) : null,
              item.label,
            ),
          ),
        )
      : null,
    props.children,
  );
}
