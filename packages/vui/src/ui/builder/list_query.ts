import type {
  EntityFilterModel,
  EntitySearchParam,
  Sort,
} from "@mmda/core";
import { readStoredPageSize } from "../../app/theme";

/**
 * 列表远程查询：排序/过滤只写 `searchParam`，皮肤必须等返回的 Promise
 * 再回写 dataSource（Syncfusion custom binding 转圈就是没等）。
 */
function ensurePager(searchParam: EntitySearchParam) {
  if (!searchParam.pager) {
    searchParam.pager = { pageNo: 1, pageSize: readStoredPageSize() };
  }
  return searchParam.pager;
}

export function writeListSorts(
  searchParam: EntitySearchParam,
  sorts: Sort[],
): EntitySearchParam {
  const pager = ensurePager(searchParam);
  pager.sorts = sorts;
  pager.pageNo = 1;
  return searchParam;
}

export function writeListFilterModel(
  searchParam: EntitySearchParam,
  filterModel: EntityFilterModel,
): EntitySearchParam {
  const pager = ensurePager(searchParam);
  const keys = Object.keys(filterModel ?? {});
  searchParam.filterModel = keys.length > 0 ? filterModel : undefined;
  pager.pageNo = 1;
  return searchParam;
}

/** 皮肤在 dataStateChange / sort / filter 后调用：先等查询，再改表格 dataSource。 */
export function settleRemoteListQuery(work: unknown): Promise<void> {
  return Promise.resolve(work).then(
    (): void => undefined,
    (): void => undefined,
  );
}
