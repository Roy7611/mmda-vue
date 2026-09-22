import { createElement, type ReactNode } from "react";

export function SfBpmnDiagram(props: {
  xml?: string;
  className?: string;
  children?: ReactNode;
}): ReactNode {
  return createElement(
    "div",
    { className: `mmda-bpmn-diagram ${props.className ?? ""}` },
    props.children ??
      (props.xml ? createElement("pre", null, props.xml) : null),
  );
}
