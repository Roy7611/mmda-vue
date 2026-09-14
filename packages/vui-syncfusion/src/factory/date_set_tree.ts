import {
  DatePeriodToken,
  DatePeriodTreeNode,
  uiCssClass,
} from "@mmda/core";
import { TreeView } from "@syncfusion/ej2-navigations";

const DAY = /^\d{4}-\d{2}-\d{2}$/;

export function dayTokensOfChecked(ids: unknown[], pivotDays: string[]): string[] {
  const days = ids
    .map((id) => DatePeriodToken.parse(id) ?? String(id ?? ""))
    .filter((id) => DAY.test(id));
  return DatePeriodToken.compact(days, pivotDays);
}

export function dateSetNodesOf(
  raw: unknown,
  monthLabel?: string,
): { nodes: DatePeriodTreeNode[]; pivotDays: string[] } {
  const tokens = DatePeriodToken.normalize(raw);
  return {
    nodes: DatePeriodTreeNode.fromTokens(tokens, { month: monthLabel }),
    pivotDays: DatePeriodToken.days(tokens),
  };
}

export function collectDateSetDays(node: DatePeriodTreeNode): string[] {
  if (!node.children?.length) return DAY.test(node.id) ? [node.id] : [];
  return node.children.flatMap(collectDateSetDays);
}

function expandedIdsOf(nodes: DatePeriodTreeNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    if (!node.children?.length) continue;
    ids.push(node.id, ...expandedIdsOf(node.children));
  }
  return ids;
}

/** 树展开后让 EJ2 筛选对话框重新量高。 */
export function refreshFilterMenu(from: HTMLElement) {
  const dialog = from.closest(".e-dialog") as
    | (HTMLElement & { ej2_instances?: Array<{ refreshPosition?: () => void }> })
    | null;
  if (!dialog) return;
  dialog.style.height = "auto";
  dialog.style.maxHeight = "none";
  const content = dialog.querySelector(".e-dlg-content");
  if (content instanceof HTMLElement) {
    content.style.height = "auto";
    content.style.maxHeight = "none";
    content.style.overflow = "visible";
  }
  dialog.ej2_instances?.[0]?.refreshPosition?.();
}

/** 官方 Menu filter：input 挂在 valuediv 上，不要塞进 Vue vnode。 */
export function mountFilterMenuInput(from: HTMLElement): HTMLInputElement {
  const target =
    from.closest(".e-flmenu-valuediv") ??
    from.closest(".e-flmenu") ??
    from.parentElement ??
    from;
  const input = document.createElement("input");
  input.className = "flm-input";
  target.appendChild(input);
  return input;
}

export function createDateSetTree(options: {
  host: HTMLElement;
  days: unknown;
  checkedTokens?: unknown[];
  monthLabel?: string;
  onChange: (tokens: string[]) => void;
}): { tree: TreeView; pivotDays: string[]; destroy: () => void } {
  const { nodes, pivotDays } = dateSetNodesOf(options.days, options.monthLabel);
  const tree = new TreeView({
    cssClass: uiCssClass("date-set-tree"),
    fields: {
      dataSource: nodes as unknown as { [key: string]: Object }[],
      id: "id",
      text: "text",
      child: "children",
    },
    showCheckBox: true,
    autoCheck: true,
    expandedNodes: expandedIdsOf(nodes),
    checkedNodes: DatePeriodToken.expandLeaves(
      options.checkedTokens ?? [],
      pivotDays,
    ),
    nodeChecked: () => {
      options.onChange(
        dayTokensOfChecked(
          tree.getAllCheckedNodes?.() ?? tree.checkedNodes ?? [],
          pivotDays,
        ),
      );
    },
  });
  tree.appendTo(options.host);
  refreshFilterMenu(options.host);
  return {
    tree,
    pivotDays,
    destroy: () => {
      if (!tree.isDestroyed) {
        try {
          tree.destroy();
        } catch {
          /* EJ2 已随筛选框拆掉 */
        }
      }
      options.host.remove();
    },
  };
}
