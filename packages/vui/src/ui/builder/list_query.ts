import {
  settleRemoteListQuery,
  writeListFilterModel as writeListFilterModelBase,
  writeListSorts as writeListSortsBase,
  type EntitySearchParam,
  type FilterModel,
  type Sort,
} from "@mmda/core";
import { readStoredPageSize } from "../../app/theme";

export { settleRemoteListQuery };

/** 列表远程查询：排序 / 过滤只写 `searchParam`；缺省分页大小沿用用户存的值。 */
export function writeListSorts(
  searchParam: EntitySearchParam,
  sorts: Sort[],
): EntitySearchParam {
  return writeListSortsBase(searchParam, sorts, readStoredPageSize());
}

export function writeListFilterModel(
  searchParam: EntitySearchParam,
  filterModel: FilterModel,
): EntitySearchParam {
  return writeListFilterModelBase(searchParam, filterModel, readStoredPageSize());
}

let paintCount = 0;

/** 控制台数列表画了几遍。搜索开始会清零，一次点击对一套序号。 */
export function resetListPaintCount() {
  paintCount = 0;
}

export function logListPaint(
  where: string,
  extra?: Record<string, unknown>,
) {
  paintCount += 1;
  console.info(`[mmda-list-paint] #${paintCount} ${where}`, extra ?? {});
}
