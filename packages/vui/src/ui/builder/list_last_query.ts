import { EntityQuery, type EntitySearchParam } from "@mmda/core";
import type { VueUiContext } from "../../contexts/vue_ui_context";

function lastQueryLogic(context: VueUiContext<any>) {
  return context.logic as
    | {
        getLastQuery?: () => Promise<EntityQuery | undefined>;
        putLastQuery?: (query: EntityQuery) => Promise<void>;
        deleteLastQuery?: () => Promise<void>;
      }
    | undefined;
}

function lastQuerySlot(context: VueUiContext<any>) {
  return context.lastQuery ?? { value: null };
}

export async function loadLastQuery(context: VueUiContext<any>) {
  const slot = lastQuerySlot(context);
  const query = (await lastQueryLogic(context)?.getLastQuery?.()) ?? null;
  slot.value = query;
  if (!query) return;
  const pageSize = context.searchParam.pager?.pageSize;
  EntityQuery.apply(context.searchParam, query);
  if (!query.queryID) delete context.searchParam.filterModel;
  if (pageSize != null && context.searchParam.pager) {
    context.searchParam.pager.pageSize = pageSize;
  }
}

export async function saveLastQuery(context: VueUiContext<any>) {
  const logic = lastQueryLogic(context);
  if (!logic?.putLastQuery) return;
  const query = EntityQuery.copy(context.searchParam as EntitySearchParam);
  await logic.putLastQuery(query);
  lastQuerySlot(context).value = query;
}

export async function applyLastQuery(context: VueUiContext<any>) {
  const query = lastQuerySlot(context).value;
  if (!query) return;
  EntityQuery.apply(context.searchParam, query);
  if (context.searchParam.pager) context.searchParam.pager.pageNo = 1;
  return context.search?.();
}

export async function dismissLastQuery(context: VueUiContext<any>) {
  const logic = lastQueryLogic(context);
  if (logic?.deleteLastQuery) {
    await logic.deleteLastQuery();
  }
  lastQuerySlot(context).value = null;
}
