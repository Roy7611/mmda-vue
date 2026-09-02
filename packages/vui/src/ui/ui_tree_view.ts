import { computed, defineComponent, h, ref, type PropType, type VNode } from "vue";
import { translateMessage } from "../i18n/i18n";
import type { UiFactory } from "./ui_factory";
import {
  filterMappedTree,
  findMappedNodeById,
  mapTreeNodes,
  selectedIdSet,
  treeIdOf,
  type UiTreeViewPropsType,
} from "./ui_tree";

export function renderTreeView(
  factory: UiFactory,
  spec: UiTreeViewPropsType,
): VNode {
  return h(
    defineComponent({
      name: "MmdaTreeView",
      props: {
        spec: { type: Object as PropType<UiTreeViewPropsType>, required: true },
      },
      setup(props) {
        const query = ref("");
        const collapsed = ref(false);
        const editing = ref("");
        const selectedLabel = computed(() => {
          const ids = selectedIdSet(props.spec.selected);
          const id = [...ids][0];
          if (!id) return "";
          const mapped = mapTreeNodes(
            props.spec.data ?? [],
            props.spec.fields,
          );
          return findMappedNodeById(mapped, id)?.label ?? "";
        });
        const treeData = computed(() => {
          if (!query.value.trim()) return props.spec.data ?? [];
          return filterMappedTree(
            mapTreeNodes(props.spec.data ?? [], props.spec.fields),
            query.value,
          ).flatMap((node) => flattenSrc(node));
        });
        const toggle = () => {
          collapsed.value = !collapsed.value;
          props.spec.onTreeCollapsed?.(collapsed.value);
        };
        return () => {
          const showSearch =
            props.spec.showTreeSearchBar ?? props.spec.showSearchbar ?? false;
          const showFooter = props.spec.showTreeFooter ?? false;
          const mode = props.spec.treeNodeActions ?? "hover";
          const onSearch = (next: string) => {
            query.value = next;
          };
          const collapseLabel = translateMessage(
            collapsed.value ? "layout.expandTree" : "layout.collapseTree",
          );
          const footerMain = props.spec.footer?.() ??
            (selectedLabel.value
              ? h(
                  "span",
                  { class: "mmda-tree-view-footer-label" },
                  selectedLabel.value,
                )
              : null);
          return h(
            "div",
            {
              class: [
                "mmda-tree-view",
                collapsed.value && "mmda-tree-view--collapsed",
              ],
              "data-mmda-tree-actions": mode,
            },
            [
              !collapsed.value && showSearch
                ? h(
                    "div",
                    { class: "mmda-tree-view-search" },
                    factory.input(query.value, {
                      placeholder: translateMessage("action.filter"),
                      "aria-label": translateMessage("action.filter"),
                      width: "100%",
                      floatLabelType: "Never",
                      showClearButton: true,
                      onUpdate: onSearch,
                      "onUpdate:modelValue": onSearch,
                    }),
                  )
                : null,
              !collapsed.value
                ? h(
                    "div",
                    { class: "mmda-tree-view-body" },
                    factory.tree({
                      data: treeData.value,
                      fields: props.spec.fields,
                      selectionMode: props.spec.selectionMode,
                      selected: props.spec.selected,
                      showIcon: props.spec.showIcon,
                      class: props.spec.class,
                      editing: editing.value,
                      contextMenu:
                        mode === "contextMenu"
                          ? (node) => {
                              const items = props.spec.contextMenu?.(node) ?? [];
                              return items.map((action) =>
                                action.name === "rename"
                                  ? {
                                      ...action,
                                      onAction: () => {
                                        editing.value = treeIdOf(
                                          node,
                                          props.spec.fields,
                                        );
                                      },
                                    }
                                  : action,
                              );
                            }
                          : undefined,
                      showHoverAdd:
                        mode === "hover" ? props.spec.showHoverAdd : false,
                      onNodeAddChild: props.spec.onNodeAddChild,
                      onNodeSelect: props.spec.onNodeSelect,
                      onExpand: props.spec.onExpand,
                      onNodeRename: (node, text) => {
                        editing.value = "";
                        props.spec.onNodeRename?.(node, text);
                      },
                    }),
                  )
                : null,
              showFooter
                ? h("footer", { class: "mmda-tree-view-footer" }, [
                    !collapsed.value && footerMain
                      ? h("div", { class: "mmda-tree-view-footer-main" }, [
                          footerMain,
                        ])
                      : null,
                    factory.button({
                      icon: factory.resolveIcon(
                        collapsed.value
                          ? "fas fa-chevron-right"
                          : "fas fa-chevron-left",
                      ),
                      tooltip: collapseLabel,
                      "aria-label": collapseLabel,
                      "aria-expanded": collapsed.value ? "false" : "true",
                      buttonType: "text",
                      shape: "circle",
                      class: "mmda-tree-view-collapse",
                      onClick: toggle,
                    }),
                  ])
                : null,
            ],
          );
        };
      },
    }),
    { spec },
  );
}

function flattenSrc<T>(node: { src: T; children: { src: T; children: any[] }[] }): T[] {
  return [node.src, ...node.children.flatMap(flattenSrc)];
}
