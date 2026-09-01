import { h, type VNode } from "vue";

/** Prefix for {@link createIconVNode} material symbol ligatures in resolveIcon maps. */
export const MATERIAL_SYMBOL_PREFIX = "__ms:";

export function isMaterialSymbol(iconClass: string): boolean {
  return iconClass.startsWith(MATERIAL_SYMBOL_PREFIX);
}

export function materialSymbolLigature(iconClass: string): string {
  return iconClass.slice(MATERIAL_SYMBOL_PREFIX.length);
}

export function mergeIconClass(
  iconClass: string,
  extra?: unknown,
): string {
  return [iconClass, extra].filter(Boolean).join(" ");
}

export function createIconVNode(
  iconClass: string,
  props?: Record<string, unknown> | null,
): VNode {
  const { class: extraClass, ...rest } = props ?? {};
  if (isMaterialSymbol(iconClass)) {
    return h(
      "span",
      {
        class: mergeIconClass("material-symbols-outlined", extraClass),
        "aria-hidden": rest["aria-hidden"] ?? true,
        ...rest,
      },
      materialSymbolLigature(iconClass),
    );
  }
  return h("i", {
    class: mergeIconClass(iconClass, extraClass),
    ...rest,
  });
}
