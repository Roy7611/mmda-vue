import type {
  EntityFilterModel,
  EntitySearchParam,
  Sort,
} from "@mmda/core";

/**
 * 列表远程查询：排序/过滤只写 `searchParam`，皮肤必须等返回的 Promise
 * 再回写 dataSource（Syncfusion custom binding 转圈就是没等）。
 */
export function writeListSorts(
  searchParam: EntitySearchParam,
  sorts: Sort[],
): EntitySearchParam {
  if (!searchParam.pager) {
    searchParam.pager = { pageNo: 1, pageSize: 20 };
  }
  searchParam.pager.sorts = sorts;
  searchParam.pager.pageNo = 1;
  return searchParam;
}

export function writeListFilterModel(
  searchParam: EntitySearchParam,
  filterModel: EntityFilterModel,
): EntitySearchParam {
  if (!searchParam.pager) {
    searchParam.pager = { pageNo: 1, pageSize: 20 };
  }
  const keys = Object.keys(filterModel ?? {});
  searchParam.filterModel = keys.length > 0 ? filterModel : undefined;
  searchParam.pager.pageNo = 1;
  return searchParam;
}

/** 皮肤在 dataStateChange / sort / filter 后调用：先等查询，再改表格 dataSource。 */
export function settleRemoteListQuery(work: unknown): Promise<void> {
  return Promise.resolve(work).then(
    () => undefined,
    () => undefined,
  );
}
