// @ts-nocheck
import type { VNode } from "vue";
import type { UiAction } from "../ui_action";
import { UiActionDivider } from "../ui_action";
import {
  categoryCreateParams,
  categoryTreeAuth,
  categoryTreeAuthHasAction,
} from "../ui_tree_category";
import {
  treeIdOf,
  treeParentFieldName,
  type UiTreePropsType,
  type UiTreeViewPropsType,
} from "../ui_tree";
import {
  deleteCategoryTreeNodeData,
  moveCategoryTreeNodeData,
  refreshCategoryTree as refreshCategoryTreeData,
  renameCategoryTreeNodeData,
  resolveCategoryTreeLogic as resolveCategoryTreeLogicOp,
} from "./category_ops";
import { resolveRepositoryModule } from "../ui_entity_view";
import { renderTreeView } from "../ui_tree_view";
import { UiViewOne } from "../ui_view";
import { UiBuildContext } from "../ui_build_context";
import type { VueUiBuilderHost } from "../ui_builder";
import type { UiContext } from "./helpers";

type Host = VueUiBuilderHost;

export function attachTreeBuilder(ctor: { prototype: Host }) {
  Object.assign(ctor.prototype, {
    buildTree<T = any>(props: UiTreePropsType<T>): VNode {
      return this.factory.tree({
        selectionMode: props.selectionMode ?? "single",
        ...props,
      });
    },
    
    buildTreeView<T = any>(
      props: UiTreeViewPropsType<T>,
      context?: UiContext,
    ): VNode {
      const categoryRepo = props.repository;
      const mode = props.editMode ?? "hover";
      const reloadTick = props.reloadTick ?? { value: 0 };
      const allowDragDrop =
        props.allowDragDrop ??
        (props.editable === true ||
          Boolean(
            context &&
              categoryRepo &&
              this.resolveCategoryTreeAuth(context, props, undefined as never)
                .allowEdit,
          ));
      const wired: UiTreeViewPropsType<T> = {
        ...props,
        reloadTick,
        editMode: mode,
        allowDragDrop,
        contextMenu:
          mode === "contextMenu" && context && categoryRepo
            ? (node: T) => this.treeCategoryMenu(context, wired, node)
            : undefined,
        showHoverAdd:
          mode === "hover" && context && categoryRepo
            ? (node: T) => this.resolveCategoryTreeAuth(context, wired, node).allowCreate
            : props.showHoverAdd,
        onNodeAddChild: (node) => {
          props.onNodeAddChild?.(node);
          if (context && categoryRepo) {
            void this.openCategoryTreeDialog(
              context,
              wired,
              UiViewOne.Create,
              node,
              "child",
            );
          }
        },
        onNodeRename: (node, text) => {
          props.onNodeRename?.(node, text);
          if (context && categoryRepo) {
            void this.renameCategoryTreeNode(context, wired, node, text);
          }
        },
        onNodeMove: async (node, parent, meta) => {
          await props.onNodeMove?.(node, parent, meta);
          if (context && categoryRepo) {
            await this.moveCategoryTreeNode(context, wired, node, parent);
          }
        },
      };
      const loadChildren =
        context &&
        categoryRepo &&
        (props.preloader || context.app?.meta)
          ? (parent?: T) => this.loadCategoryTreeNodes(context, wired, parent)
          : undefined;
      return renderTreeView(this.factory, wired, loadChildren);
    },
    
    async loadCategoryTreeNodes<T>(
      context: UiContext,
      props: UiTreeViewPropsType<T>,
      parent?: T,
    ): Promise<T[]> {
      if (!parent && props.loadMode === "lazy" && props.preloader) {
        return (await props.preloader()) ?? [];
      }
      const repository = props.repository;
      if (!repository || !context.app?.meta) return props.data ?? [];
      const catLogic = await resolveCategoryTreeLogicOp(context, repository);
      const lazy = props.loadMode === "lazy";
      if (!lazy && !parent) {
        const page = await catLogic.getAll({
          pager: { pageNo: 1, pageSize: 1000 },
        });
        return (page?.list ?? []) as T[];
      }
      const parentField = treeParentFieldName(props.fields);
      const parentId = parent ? treeIdOf(parent, props.fields) : "";
      const page = await catLogic.getAll({
        pager: { pageNo: 1, pageSize: 1000 },
        queryParams: { [parentField]: parentId },
      });
      return (page?.list ?? []) as T[];
    },
    
    resolveCategoryTreeAuth<T>(
      context: UiContext,
      props: UiTreeViewPropsType<T>,
      node: T,
    ) {
      const repository = props.repository;
      const catModule =
        repository && context.app
          ? (resolveRepositoryModule(context.app, repository) ??
            context.app.findModule(repository))
          : undefined;
      const flags = node as { editable?: boolean; deletable?: boolean };
      const catAuth = categoryTreeAuth(catModule, flags);
      const listAuth = categoryTreeAuth(context.module, flags);
      return catModule?.authority && categoryTreeAuthHasAction(catAuth)
        ? catAuth
        : listAuth;
    },
    
    treeCategoryMenu<T>(
      context: UiContext,
      props: UiTreeViewPropsType<T>,
      node: T,
    ): UiAction[] {
      const repository = props.repository;
      if (!repository || node == null) return [];
      const auth = this.resolveCategoryTreeAuth(context, props, node);
      const t = (key: string) => context.t(key);
      const items: UiAction[] = [];
      if (auth.allowRead) {
        items.push({
          name: "view",
          label: t("action.view"),
          icon: this.factory.resolveIcon("details"),
          onAction: () =>
            this.openCategoryTreeDialog(context, props, UiViewOne.Details, node),
        });
      }
      if (auth.allowCreate) {
        if (items.length) items.push(UiActionDivider());
        items.push(
          {
            name: "addRoot",
            label: t("action.addRoot"),
            icon: this.factory.resolveIcon("plus"),
            onAction: () =>
              this.openCategoryTreeDialog(context, props, UiViewOne.Create, node, "root"),
          },
          {
            name: "addChild",
            label: t("action.addChild"),
            icon: this.factory.resolveIcon("plus"),
            onAction: () =>
              this.openCategoryTreeDialog(context, props, UiViewOne.Create, node, "child"),
          },
          {
            name: "addSibling",
            label: t("action.addSibling"),
            icon: this.factory.resolveIcon("plus"),
            onAction: () =>
              this.openCategoryTreeDialog(
                context,
                props,
                UiViewOne.Create,
                node,
                "sibling",
              ),
          },
        );
      }
      if (auth.allowDelete) {
        if (items.length) items.push(UiActionDivider());
        items.push({
          name: "delete",
          label: t("action.delete"),
          icon: this.factory.resolveIcon("delete"),
          onAction: () => this.deleteCategoryTreeNode(context, props, node),
        });
      }
      if (auth.allowEdit) {
        if (items.length) items.push(UiActionDivider());
        items.push(
          {
            name: "edit",
            label: t("action.edit"),
            icon: this.factory.resolveIcon("edit"),
            onAction: () =>
              this.openCategoryTreeDialog(context, props, UiViewOne.Edit, node),
          },
          {
            name: "rename",
            label: t("action.rename"),
            icon: this.factory.resolveIcon("edit"),
          },
        );
      }
      return items;
    },
    
    async resolveCategoryTreeLogic(
      context: UiContext,
      repository: string,
    ) {
      return resolveCategoryTreeLogicOp(context, repository);
    },
    
    
    async refreshCategoryTree<T>(
      _context: UiContext,
      props: UiTreeViewPropsType<T>,
      logic: { getAll?: (param: any) => Promise<{ list?: unknown[] }> },
    ) {
      await refreshCategoryTreeData(props, logic);
    },
    
    async openCategoryTreeDialog<T>(
      context: UiContext,
      props: UiTreeViewPropsType<T>,
      view: typeof UiViewOne.Create | typeof UiViewOne.Edit | typeof UiViewOne.Details,
      node: T,
      createKind?: "root" | "child" | "sibling",
    ) {
      const repository = props.repository;
      const app = context.app;
      if (!repository || !app) return;
      const catLogic = await resolveCategoryTreeLogicOp(context, repository);
      const pack = await app.meta.getPack({
        repository,
        service: catLogic.apiService,
      });
      if (!pack?.metaui) return;
      const id = view === UiViewOne.Create ? undefined : treeIdOf(node, props.fields);
      const queryParams =
        view === UiViewOne.Create
          ? categoryCreateParams(createKind ?? "root", node, props.fields)
          : undefined;
      const ctx = new UiBuildContext({
        model: (id ? { id } : {}) as any,
        metaui: pack.metaui,
        view,
        logic: catLogic,
        app,
        locale: context.locale,
      });
      await ctx.init({ path: id, queryParams });
      const editing = view !== UiViewOne.Details;
      const accepted = await app.ui.dialog(
        this.buildView(ctx, { showBreadcrumb: false }),
        ctx,
        {
          name: view,
          title: pack.metaui.displayLabel,
          width: "70vw",
          height: "80vh",
          maxHeight: "90vh",
          showFooter: editing,
          accept: editing
            ? async () => {
                const saved = await ctx.save();
                return saved !== false;
              }
            : undefined,
        },
      );
      if (!accepted && view === UiViewOne.Create) {
        const createdId = (ctx.model as { id?: string }).id;
        if (createdId) await catLogic.delete(createdId);
        return;
      }
      if (accepted || view === UiViewOne.Details) {
        if (accepted) await refreshCategoryTreeData(props, catLogic);
      }
    },
    
    async deleteCategoryTreeNode<T>(
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
          `Delete ${title}?`,
        buttons: ["yes", "no"],
      });
      if (result !== "yes") return;
      await deleteCategoryTreeNodeData(context, props, node);
    },
    
    async renameCategoryTreeNode<T>(
      context: UiContext,
      props: UiTreeViewPropsType<T>,
      node: T,
      text: string,
    ) {
      await renameCategoryTreeNodeData(context, props, node, text);
    },
    
    async moveCategoryTreeNode<T>(
      context: UiContext,
      props: UiTreeViewPropsType<T>,
      node: T,
      parent: T | undefined,
    ) {
      if (!this.resolveCategoryTreeAuth(context, props, node).allowEdit) return;
      await moveCategoryTreeNodeData(context, props, node, parent);
    },
  } as any);
}
