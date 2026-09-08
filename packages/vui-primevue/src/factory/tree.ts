import { h } from "vue";
import { PrimeTree } from "../components/PrimeTree";
import type { UiTreePropsType } from "@mmda/vui";
import { treeModifierClasses } from "@mmda/vui";

export function createTree<T = any>(props: UiTreePropsType<T>) {
  const { class: _className, ...rest } = props;
  return h(PrimeTree as any, {
    ...rest,
    class: treeModifierClasses(props),
  });
}
