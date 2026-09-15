import { EntityQuery, type EntitySearchParam } from "@mmda/core";
import type { VueUiContext } from "../../contexts/vue_ui_context";
import { listServiceName } from "./list_layout";

function lastQueryService(context: VueUiContext<any>) {
  return context.logic?.metaUiService as
    | {
        getLastQuery?: (
          repository: string,
          service?: string,
        ) => Promise<EntityQuery | undefined>;
        putLastQuery?: (
          repository: string,
          query: EntityQuery,
          service?: string,
        ) => Promise<void>;
        deleteLastQuery?: (
          repository: string,
          service?: string,
        ) => Promise<void>;
      }
    | undefined;
}

function lastQueryRepo(context: VueUiContext<any>) {
  const repository = context.logic?.repository as string | undefined;
  if (!repository) return undefined;
  return {
    repository,
    service: listServiceName(context),
    api: lastQueryService(context),
  };
}

function lastQuerySlot(context: VueUiContext<any>) {
  return context.lastQuery ?? { value: null };
}

export async function loadLastQuery(context: VueUiContext<any>) {
  const slot = lastQuerySlot(context);
  const target = lastQueryRepo(context);
  if (!target?.api?.getLastQuery) {
    slot.value = null;
    return;
  }
  slot.value =
    (await target.api.getLastQuery(target.repository, target.service)) ?? null;
}

export async function saveLastQuery(context: VueUiContext<any>) {
  const target = lastQueryRepo(context);
  if (!target?.api?.putLastQuery) return;
  const query = EntityQuery.copy(context.searchParam as EntitySearchParam);
  await target.api.putLastQuery(target.repository, query, target.service);
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
  const target = lastQueryRepo(context);
  if (target?.api?.deleteLastQuery) {
    await target.api.deleteLastQuery(target.repository, target.service);
  }
  lastQuerySlot(context).value = null;
}
