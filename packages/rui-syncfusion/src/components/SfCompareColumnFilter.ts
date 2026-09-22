import { createElement, useState, type ReactNode } from "react";

export type CompareColumnVariant = "date" | "datetime" | "time" | "number";

export const COMPARE_FILTER_OPERATORS: Record<
  CompareColumnVariant,
  readonly string[]
> = {
  date: ["eq", "ne", "gt", "lt", "ge", "le"],
  datetime: ["eq", "ne", "gt", "lt", "ge", "le"],
  time: ["eq", "ne", "gt", "lt", "ge", "le"],
  number: ["eq", "ne", "gt", "lt", "ge", "le"],
};

export type SfCompareColumnFilterHandle = {
  operator?: string;
  value?: unknown;
};

export function SfCompareColumnFilter(props: {
  variant?: CompareColumnVariant;
  handle?: SfCompareColumnFilterHandle;
  onChange?: (handle: SfCompareColumnFilterHandle) => void;
  children?: ReactNode;
}): ReactNode {
  const [operator, setOperator] = useState(props.handle?.operator ?? "eq");
  const [value, setValue] = useState(props.handle?.value ?? "");
  const variant = props.variant ?? "number";

  const emit = (nextOperator: string, nextValue: unknown) => {
    setOperator(nextOperator);
    setValue(nextValue as string);
    props.onChange?.({ operator: nextOperator, value: nextValue });
  };

  return createElement(
    "div",
    { className: "mmda-compare-filter" },
    createElement(
      "select",
      {
        value: operator,
        onChange: (event: any) => emit(event.target.value, value),
      },
      COMPARE_FILTER_OPERATORS[variant].map((op) =>
        createElement("option", { value: op, key: op }, op),
      ),
    ),
    createElement("input", {
      type:
        variant === "number"
          ? "number"
          : variant === "time"
            ? "time"
            : variant === "datetime"
              ? "datetime-local"
              : "date",
      value: value as string,
      onChange: (event: any) => emit(operator, event.target.value),
    }),
    props.children,
  );
}

export const SfDateColumnFilter = (props: any) =>
  createElement(SfCompareColumnFilter, { ...props, variant: "date" });
export const SfDateTimeColumnFilter = (props: any) =>
  createElement(SfCompareColumnFilter, { ...props, variant: "datetime" });
export const SfTimeColumnFilter = (props: any) =>
  createElement(SfCompareColumnFilter, { ...props, variant: "time" });
export const SfNumberColumnFilter = (props: any) =>
  createElement(SfCompareColumnFilter, { ...props, variant: "number" });
