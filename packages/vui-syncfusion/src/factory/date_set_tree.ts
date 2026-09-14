import {
  DatePeriodToken,
  DatePeriodTreeNode,
  uiCssClass,
} from "@mmda/core";
import { DropDownTree } from "@syncfusion/ej2-dropdowns";

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
  input: HTMLInputElement;
  days: unknown;
  checkedTokens?: unknown[];
  monthLabel?: string;
  placeholder?: string;
  locale?: string;
  onChange: (tokens: string[]) => void;
}): { tree: DropDownTree; pivotDays: string[]; destroy: () => void } {
  const { nodes, pivotDays } = dateSetNodesOf(options.days, options.monthLabel);
  const tree = new DropDownTree({
    cssClass: uiCssClass("date-set-dropdown"),
    fields: {
      dataSource: nodes as unknown as { [key: string]: Object }[],
      value: "id",
      text: "text",
      child: "children",
    },
    showCheckBox: true,
    allowMultiSelection: true,
    treeSettings: { autoCheck: true },
    value: DatePeriodToken.expandLeaves(options.checkedTokens ?? [], pivotDays),
    placeholder: options.placeholder,
    popupHeight: "200px",
    width: "100%",
    zIndex: 1_000_000,
    locale: options.locale,
    showClearButton: true,
    allowFiltering: true,
    change: (e: { value?: string[] }) => {
      options.onChange(
        dayTokensOfChecked(e.value ?? tree.value ?? [], pivotDays),
      );
    },
  });
  tree.appendTo(options.input);
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
      options.input.remove();
    },
  };
}
