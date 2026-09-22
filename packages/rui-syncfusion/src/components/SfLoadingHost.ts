import { createElement, type ReactNode } from "react";

export interface SfLoadingHostProps {
  loading?: boolean;
  label?: string;
  children?: ReactNode;
}

export function SfLoadingHost(props: SfLoadingHostProps): ReactNode {
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

export const SfGridLoadingHost = SfLoadingHost;
