import { defineEntity } from "@mmda/core";
import type { UiViewContext } from "../../contexts/view_context";
import { resolveRepositoryModule } from "../../components/EntityView";
import { GenericUiLogic } from "../../logic/logic";
import { categoryMoveParams } from "./tree_category";
import {
  collectNodeAndDescendantIds,
  treeCannotDropOn,
  treeIdOf,
  treeLabelFieldName,
  treeParentFieldName,
  type UiTreeViewPropsType,
} from "../factory/tree";

type UiContext = UiViewContext<any>;

/** 分类树 CRUD 走 Logic，Builder 只负责确认框 / 打开视图。 */
export async function resolveCategoryTreeLogic(
  context: UiContext,
  repository: string,
) {
  const app = context.app;
  const service =
    (context.logic as { apiService?: string } | undefined)?.apiService ??
    app?.name ??
    "base";
  const token = `${service}:${repository}Logic`;
  try {
    const injected = await app?.di.injectAsync<
      InstanceType<typeof GenericUiLogic>
    >(token);
    if (injected) return injected;
  } catch {
    // 未注册的仓库走通用 Logic
  }
  const module =
    resolveRepositoryModule(app, repository) ?? app?.findModule(repository);
  return new GenericUiLogic(defineEntity, {
    metaUiService: app!.meta,
    repository,
    router: context.logic?.router,
    module,
    apiService: service,
  });
}

export async function refreshCategoryTree<T>(
  props: UiTreeViewPropsType<T>,
  logic: { getAll?: (param: any) => Promise<{ list?: unknown[] }> },
) {
  if (props.onTreeRefresh) {
    await props.onTreeRefresh();
  }
  if (props.reloadTick) {
    props.reloadTick.value += 1;
    return;
  }
  if (!logic.getAll) return;
  const page = await logic.getAll({
    pager: { pageNo: 1, pageSize: 1000 },
  });
  if (props.data) {
    props.data.splice(0, props.data.length, ...((page?.list ?? []) as T[]));
  }
}

export async function deleteCategoryTreeNodeData<T>(
  context: UiContext,
  props: UiTreeViewPropsType<T>,
  node: T,
) {
  const repository = props.repository;
  if (!repository) return;
  const catLogic = await resolveCategoryTreeLogic(context, repository);
  const ids = collectNodeAndDescendantIds(
    props.data ?? [],
    node,
    props.fields,
  );
  if (ids.length > 1 && catLogic.deleteAll) {
    await catLogic.deleteAll(ids);
  } else {
    for (const id of ids) await catLogic.delete(id);
  }
  const listLogic = context.logic as {
    currentCategory?: { id?: string; categoryID?: string };
  };
  const currentId =
    listLogic.currentCategory?.id ?? listLogic.currentCategory?.categoryID;
  if (currentId && ids.includes(String(currentId))) {
    listLogic.currentCategory = undefined;
    const runtime = context as { search?: () => Promise<unknown> };
    void runtime.search?.();
  }
  await refreshCategoryTree(props, catLogic);
  props.onNodeDelete?.(node);
}

export async function renameCategoryTreeNodeData<T>(
  context: UiContext,
  props: UiTreeViewPropsType<T>,
  node: T,
  text: string,
) {
  const repository = props.repository;
  if (!repository) return;
  const field = treeLabelFieldName(props.fields);
  const nextText = text.trim();
  const prev = String((node as Record<string, unknown>)[field] ?? "").trim();
  if (!nextText || nextText === prev) return;
  const next = { ...(node as object), [field]: nextText } as T;
  const catLogic = await resolveCategoryTreeLogic(context, repository);
  await catLogic.save(next as any);
  await refreshCategoryTree(props, catLogic);
}

export async function moveCategoryTreeNodeData<T>(
  context: UiContext,
  props: UiTreeViewPropsType<T>,
  node: T,
  parent: T | undefined,
) {
  const repository = props.repository;
  if (!repository) return;
  const treeData = props.data?.length
    ? props.data
    : ([node, parent].filter(Boolean) as T[]);
  if (parent && treeCannotDropOn(node, parent, treeData, props.fields)) {
    throw new Error("invalid tree drop");
  }
  const parentKey = treeParentFieldName(props.fields);
  const parentId = parent ? treeIdOf(parent, props.fields) : "";
  const prevId = String(
    (node as Record<string, unknown>)[parentKey] ??
      (node as Record<string, unknown>).parentCatID ??
      (node as Record<string, unknown>).parentId ??
      "",
  );
  if (parentId === prevId) return;
  const next = categoryMoveParams(node, parent, props.fields) as T;
  const catLogic = await resolveCategoryTreeLogic(context, repository);
  await catLogic.save(next as any);
  Object.assign(node as object, next);
}
