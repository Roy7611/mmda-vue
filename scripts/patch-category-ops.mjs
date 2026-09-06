import fs from "node:fs";

const path = "packages/vui/src/ui/ui_builder.ts";
let s = fs.readFileSync(path, "utf8");

if (!s.includes('from "./ui_entity_view"') && !s.includes("resolveRepositoryModule")) {
  s = s.replace(
    'from "./ui_category_ops";',
    'from "./ui_category_ops";\nimport { resolveRepositoryModule } from "./ui_entity_view";',
  );
}

function replaceMethod(src, name, body) {
  const re = new RegExp(
    `  protected async ${name}\\([\\s\\S]*?\\n  \\}\\n(?=\\n  (?:protected |public |private |build|async |get ))`,
  );
  if (!re.test(src)) {
    console.error("failed replace", name);
    return src;
  }
  return src.replace(re, `${body}\n\n`);
}

s = replaceMethod(
  s,
  "resolveCategoryTreeLogic",
  `  protected async resolveCategoryTreeLogic(
    context: UiContext,
    repository: string,
  ) {
    return resolveCategoryTreeLogicOp(context, repository);
  }`,
);

s = replaceMethod(
  s,
  "refreshCategoryTree",
  `  protected async refreshCategoryTree<T>(
    _context: UiContext,
    props: UiTreeViewPropsType<T>,
    logic: { getAll?: (param: any) => Promise<{ list?: unknown[] }> },
  ) {
    await refreshCategoryTreeData(props, logic);
  }`,
);

s = replaceMethod(
  s,
  "deleteCategoryTreeNode",
  `  protected async deleteCategoryTreeNode<T>(
    context: UiContext,
    props: UiTreeViewPropsType<T>,
    node: T,
  ) {
    const repository = props.repository;
    if (!repository) return;
    const title =
      (node as { categoryName?: string; label?: string; name?: string })
        .categoryName ??
      (node as { label?: string }).label ??
      (node as { name?: string }).name ??
      treeIdOf(node, props.fields);
    const result = await this.confirm(context, {
      message:
        context.translate?.("confirmation.delete", { it: title }) ??
        \`Delete \${title}?\`,
      buttons: ["yes", "no"],
    });
    if (result !== "yes") return;
    await deleteCategoryTreeNodeData(context, props, node);
  }`,
);

s = replaceMethod(
  s,
  "renameCategoryTreeNode",
  `  protected async renameCategoryTreeNode<T>(
    context: UiContext,
    props: UiTreeViewPropsType<T>,
    node: T,
    text: string,
  ) {
    await renameCategoryTreeNodeData(context, props, node, text);
  }`,
);

s = replaceMethod(
  s,
  "moveCategoryTreeNode",
  `  protected async moveCategoryTreeNode<T>(
    context: UiContext,
    props: UiTreeViewPropsType<T>,
    node: T,
    parent: T | undefined,
  ) {
    if (!this.resolveCategoryTreeAuth(context, props, node).allowEdit) return;
    await moveCategoryTreeNodeData(context, props, node, parent);
  }`,
);

// openCategoryTreeDialog: use shared resolve/refresh helpers
s = s.replace(
  /await this\.resolveCategoryTreeLogic\(/g,
  "await resolveCategoryTreeLogicOp(",
);
s = s.replace(
  /await this\.refreshCategoryTree\(context, props, catLogic\)/g,
  "await refreshCategoryTreeData(props, catLogic)",
);

fs.writeFileSync(path, s);
console.log("ok");
