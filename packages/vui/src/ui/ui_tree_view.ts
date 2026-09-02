import {
  defineComponent,
  h,
  onMounted,
  ref,
  watch,
  type PropType,
  type VNode,
} from "vue";
import { translateMessage } from "../i18n/i18n";
import type { UiFactory } from "./ui_factory";
import {
  filterMappedTree,
  mapTreeNodes,
  setTreeChildren,
  treeIdOf,
  treeLabelOf,
  treeShouldLoadChildren,
  type UiTreeFields,
  type UiTreeViewPropsType,
} from "./ui_tree";

export type TreeChildrenLoader<T = any> = (parent?: T) => Promise<T[]>;

function mergeTreeNodes<T>(
  current: T[],
  incoming: T[],
  fields?: UiTreeFields<T>,
): T[] {
  const byId = new Map<string, T>();
  for (const node of current) {
    const id = treeIdOf(node, fields);
    if (id) byId.set(id, node);
  }
  for (const node of incoming) {
    const id = treeIdOf(node, fields);
    if (id) byId.set(id, node);
  }
  return [...byId.values()];
}

const MmdaTreeView = defineComponent({
  name: "MmdaTreeView",
  props: {
    spec: { type: Object as PropType<UiTreeViewPropsType>, required: true },
    factory: { type: Object as PropType<UiFactory>, required: true },
    loadChildren: {
      type: Function as PropType<TreeChildrenLoader>,
      default: undefined,
    },
  },
  setup(props) {
    const query = ref("");
    const editing = ref("");
    const localData = ref(props.spec.data ?? []);
    const picked = ref(props.spec.selectedNode);

    const loadInitial = async (force = false) => {
      if (props.loadChildren) {
        if (!force && localData.value.length) return;
        const nodes = await props.loadChildren();
        localData.value = mergeTreeNodes([], nodes, props.spec.fields);
        return;
      }
      localData.value = props.spec.data ?? [];
    };

    onMounted(() => {
      void loadInitial();
    });
    watch(
      () => props.spec.data,
      (data) => {
        if (props.loadChildren) return;
        localData.value = data ?? [];
      },
    );
    watch(
      () => props.spec.reloadTick?.value,
      () => {
        if (props.loadChildren) void loadInitial(true);
      },
    );
    watch(
      () => props.spec.selectedNode,
      (node) => {
        if (node !== undefined) picked.value = node;
      },
    );

    const onNodeSelect = (node: unknown) => {
      const one = Array.isArray(node) ? node[0] : node;
      if (one !== undefined) picked.value = one;
      props.spec.onNodeSelect?.(node as never);
    };

    const onExpand = async (expanded: unknown) => {
      const spec = props.spec;
      if (
        spec.loadMode === "lazy" &&
        props.loadChildren &&
        treeShouldLoadChildren(expanded, spec.fields)
      ) {
        const kids = await props.loadChildren(expanded);
        setTreeChildren(expanded, kids, spec.fields);
        localData.value = localData.value.slice();
      }
      await spec.onExpand?.(expanded);
    };

    const onNodeRename = (item: unknown, text: string) => {
      editing.value = "";
      props.spec.onNodeRename?.(item as never, text);
    };

    return () => {
      const factory = props.factory;
      const spec = props.spec;
      const showSearch = spec.showSearchBar ?? false;
      const showFooter = spec.showTreeFooter ?? false;
      const mode = spec.editMode ?? "hover";
      const onSearch = (next: string) => {
        query.value = next;
      };
      const header = spec.header?.();
      const hasHeader = header != null && header !== false;
      const treeData = query.value.trim()
        ? filterMappedTree(
            mapTreeNodes(localData.value, spec.fields),
            query.value,
          ).flatMap((item) => flattenSrc(item))
        : localData.value;
      return h(
        "div",
        {
          class: "mmda-tree-view",
          "data-mmda-tree-actions": mode,
        },
        [
          hasHeader
            ? h("div", { class: "mmda-tree-view-header" }, header)
            : showSearch
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
          h(MmdaTreeViewBody, {
            factory,
            spec,
            treeData,
            editing: editing.value,
            mode,
            onExpand,
            onNodeSelect,
            onNodeRename,
            onBeginRename: (item: unknown) => {
              editing.value = treeIdOf(item, spec.fields);
            },
          }),
          showFooter
            ? h(MmdaTreeViewFooter, { spec, node: picked.value })
            : null,
        ],
      );
    };
  },
});

const MmdaTreeViewBody = defineComponent({
  name: "MmdaTreeViewBody",
  props: {
    factory: { type: Object as PropType<UiFactory>, required: true },
    spec: { type: Object as PropType<UiTreeViewPropsType>, required: true },
    treeData: { type: Array, required: true },
    editing: { type: String, default: "" },
    mode: { type: String, default: "hover" },
    onExpand: { type: Function, required: true },
    onNodeSelect: { type: Function, required: true },
    onNodeRename: { type: Function, required: true },
    onBeginRename: { type: Function, required: true },
  },
  setup(props) {
    return () => {
      const spec = props.spec;
      return h(
        "div",
        { class: "mmda-tree-view-body" },
        props.factory.tree({
          data: props.treeData,
          fields: spec.fields,
          selectionMode: spec.selectionMode,
          selected: spec.selected,
          showIcon: spec.showIcon,
          class: spec.class,
          editing: props.editing,
          contextMenu:
            props.mode === "contextMenu"
              ? (item) => {
                  const items = spec.contextMenu?.(item) ?? [];
                  return items.map((action) =>
                    action.name === "rename"
                      ? {
                          ...action,
                          onAction: () => {
                            props.onBeginRename(item);
                          },
                        }
                      : action,
                  );
                }
              : undefined,
          showHoverAdd: props.mode === "hover" ? spec.showHoverAdd : false,
          onNodeAddChild: spec.onNodeAddChild,
          onNodeSelect: props.onNodeSelect,
          onExpand: props.onExpand,
          onNodeRename: props.onNodeRename,
        }),
      );
    };
  },
});

const MmdaTreeViewFooter = defineComponent({
  name: "MmdaTreeViewFooter",
  props: {
    spec: { type: Object as PropType<UiTreeViewPropsType>, required: true },
    node: { default: undefined },
  },
  setup(props) {
    return () => {
      const spec = props.spec;
      const node = props.node;
      const footerMain =
        spec.footer?.() ??
        (node && spec.footerContent ? spec.footerContent(node) : null) ??
        (node
          ? h(
              "span",
              { class: "mmda-tree-view-footer-label" },
              treeLabelOf(node, spec.fields),
            )
          : null);
      return h("footer", { class: "mmda-tree-view-footer mmda-user-footer" }, [
        footerMain
          ? h(
              "div",
              {
                class: "mmda-tree-view-footer-main mmda-user-footer__name",
              },
              [footerMain],
            )
          : null,
      ]);
    };
  },
});

export function renderTreeView(
  factory: UiFactory,
  spec: UiTreeViewPropsType,
  loadChildren?: TreeChildrenLoader,
): VNode {
  return h(MmdaTreeView, { spec, factory, loadChildren });
}

function flattenSrc<T>(node: {
  src: T;
  children: { src: T; children: any[] }[];
}): T[] {
  return [node.src, ...node.children.flatMap(flattenSrc)];
}
