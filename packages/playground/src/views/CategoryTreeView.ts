import { defineComponent, h, ref, type PropType } from "vue";
import type { UiBuildContext } from "@mmda/vui";
import { categoryRows, nextId, type Category } from "../catalog";

export const CategoryTreeView = defineComponent({
  name: "CategoryTreeView",
  props: {
    ctx: { type: Object as PropType<UiBuildContext>, required: true },
  },
  setup(props) {
    const selected = ref("");
    return () => {
      const builder = props.ctx.app!.ui;
      return h(
        "div",
        {
          class: "mmda-list-view mmda-playground-tree-page",
          style: {
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
          },
        },
        [
          builder.buildModuleToolbar(props.ctx, { showActions: false }),
          builder.buildTreeView({
            data: categoryRows,
            fields: {
              id: "id",
              label: "name",
              parentId: "parentId",
              icon: "icon",
            },
            showIcon: true,
            showTreeSearchBar: true,
            editable: true,
            selected: selected.value,
            onNodeSelect: (node: Category | Category[]) => {
              const current = Array.isArray(node) ? node[0] : node;
              selected.value = current?.id ?? "";
            },
            onNodeRename: (node: Category, text: string) => {
              node.name = text;
            },
            onNodeAdd: (parent?: Category) => {
              categoryRows.push({
                id: nextId(categoryRows),
                rowNum: "",
                name: "新分类",
                parentId: parent?.id ?? "",
                icon: "fas fa-folder",
                editable: true,
                deletable: true,
                entityState: 2,
              });
            },
            onNodeAddChild: (parent: Category) => {
              categoryRows.push({
                id: nextId(categoryRows),
                rowNum: "",
                name: `${parent.name}-子`,
                parentId: parent.id,
                icon: "fas fa-folder",
                editable: true,
                deletable: true,
                entityState: 2,
              });
            },
            onNodeAddSibling: (node: Category) => {
              categoryRows.push({
                id: nextId(categoryRows),
                rowNum: "",
                name: `${node.name}-兄弟`,
                parentId: node.parentId,
                icon: "fas fa-folder",
                editable: true,
                deletable: true,
                entityState: 2,
              });
            },
            onNodeDelete: (node: Category) => {
              const index = categoryRows.findIndex((row) => row.id === node.id);
              if (index >= 0) categoryRows.splice(index, 1);
              if (selected.value === node.id) selected.value = "";
            },
          }),
        ],
      );
    };
  },
});
