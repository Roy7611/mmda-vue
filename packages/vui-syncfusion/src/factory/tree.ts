import { h } from "vue";
import { SfTree } from "../components/SfTree";
import type { UiTreePropsType } from "@mmda/vui";
import { treeModifierClasses } from "@mmda/vui";

export function createTree<T = any>(props: UiTreePropsType<T>) {
  const { class: _className, ...rest } = props;
  return h(SfTree as any, {
    ...rest,
    class: treeModifierClasses(props),
  });
}
