import { createElement, type ReactNode } from "react";
import { TreeGridComponent } from "@syncfusion/ej2-react-treegrid";

export function SfTreeGrid(props: {
  dataSource?: unknown[];
  childMapping?: string;
  columns?: unknown[];
  height?: string | number;
  children?: ReactNode;
}): ReactNode {
  return createElement(
    TreeGridComponent as any,
    {
      dataSource: props.dataSource ?? [],
      childMapping: props.childMapping,
      columns: props.columns ?? [],
      height: props.height ?? "100%",
    },
    props.children,
  );
}
