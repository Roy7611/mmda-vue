import { createElement, type ReactNode } from "react";

export interface SfRuiLoadingHostProps {
  loading?: boolean;
  label?: string;
  children?: ReactNode;
}

export function SfRuiLoadingHost(props: SfRuiLoadingHostProps): ReactNode {
  return createElement(
    "div",
    { className: "mmda-loading-host" },
    props.loading
      ? createElement(
          "div",
          { className: "e-spinner mmda-loading-spinner" },
          props.label,
        )
      : null,
    props.children,
  );
}

export const SfRuiGridLoadingHost = SfRuiLoadingHost;
