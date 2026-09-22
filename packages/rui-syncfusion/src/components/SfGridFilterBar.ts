import { createElement, type ReactNode } from "react";

export interface SfGridFilterBarLabels {
  clear?: string;
}

export function SfGridFilterBar(props: {
  fields?: { fieldName: string; label: string }[];
  labels?: SfGridFilterBarLabels;
  onRemove?: (fieldName: string) => void;
  children?: ReactNode;
}): ReactNode {
  const fields = props.fields ?? [];
  return createElement(
    "div",
    { className: "mmda-grid-filter-bar" },
    fields.map((field) =>
      createElement(
        "span",
        { className: "mmda-filter-chip", key: field.fieldName },
        field.label,
        createElement(
          "button",
          {
            type: "button",
            "aria-label": props.labels?.clear ?? "清除",
            onClick: () => props.onRemove?.(field.fieldName),
          },
          "×",
        ),
      ),
    ),
    props.children,
  );
}
