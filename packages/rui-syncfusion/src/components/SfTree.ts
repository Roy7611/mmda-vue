import { createElement, type ReactNode } from "react";

export interface SfTreeNode {
  id?: string;
  label?: string;
  icon?: string;
  children?: SfTreeNode[];
}

function renderTreeNodes(nodes: SfTreeNode[] = []): ReactNode {
  return nodes.map((node, index) =>
    createElement(
      "li",
      { key: node.id ?? index },
      createElement(
        "div",
        { className: "mmda-tree-node" },
        node.icon ? createElement("i", { className: node.icon }) : null,
        node.label,
      ),
      node.children?.length
        ? createElement(
            "ul",
            { className: "mmda-tree-children" },
            renderTreeNodes(node.children),
          )
        : null,
    ),
  );
}

export function SfTree(props: {
  nodes?: SfTreeNode[];
  children?: ReactNode;
}): ReactNode {
  return createElement(
    "div",
    { className: "mmda-tree" },
    createElement("ul", null, renderTreeNodes(props.nodes)),
    props.children,
  );
}
