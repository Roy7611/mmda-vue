import { isObject } from "../utils/is";

/**
 * 排序
 */
export enum SortOrder {
  ASC = "ASC", //升序
  DESC = "DESC", //降序
}
export interface Sort {
  sortBy: string;
  sortOrder: SortOrder;
}
class SortImpl implements Sort {
  constructor(public readonly sortBy: string, public readonly sortOrder: SortOrder = SortOrder.ASC) { }
  static parse(sort: string) {
    const s = sort.split(' ');
    if (s.length > 1 && s[1] == SortOrder.DESC) return new SortImpl(s[0], s[1]);
    else return new SortImpl(s[0]);
  }
  get descending() {
    return this.sortOrder == SortOrder.DESC;
  }
  toString() {
    return `${this.sortBy} ${this.sortOrder}`;
  }
}
export const SortCtor = (sortBy: string, sortOrder: SortOrder = SortOrder.ASC) => new SortImpl(sortBy, sortOrder);
export const parseSorts = (sort: string): Sort[] => {
  if (!sort) return []
  return sort.split(',').map(SortImpl.parse)
}
/**
 * 分页器
 */
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000] as const;

export interface Pager {
  pageSize: number;
  pageNo?: number;
  sorts?: Sort[];
}

// declare var Pager: {
//   prototype: Pager;
//   new(init?: PagerInit): Pager;
// };
class PagerImpl implements Pager {
  constructor(public pageSize: number, public pageNo: number = 1, public sorts?: Sort[]) { }
  static fromJSON(o: { pageSize?: number, pageNo?: number, sort?: string, [index: string]: any }) {
    const { pageSize = DEFAULT_PAGE_SIZE, pageNo = 1, sort } = o;
    if (sort) {
      const stringSorts = sort.split(',')
      return new PagerImpl(pageSize, pageNo, stringSorts.map(SortImpl.parse))
    }
    return new PagerImpl(pageSize, pageNo)
  }
  addSort(sort: Sort) {
    (this.sorts ??= []).push(sort);
  }
  clearSorts() {
    this.sorts = [];
  }
  setSingleSort(sort: Sort) {
    this.sorts = [sort];
  }

  private getSortString() {
    let sortStr = '';
    if (this.sorts && this.sorts.length > 0)
      sortStr = this.sorts.map(s => s.toString()).join(',');
    return sortStr;
  }
  toJSON() {
    return {
      pageSize: this.pageSize,
      pageNo: this.pageNo,
      sort: this.getSortString()
    }
  }
  toString() {
    return `pageSize=${this.pageSize}&pageNo=${this.pageNo}&sort=${this.getSortString()}`;
  }
}
export const PagerCtor = (pageSize = DEFAULT_PAGE_SIZE, pageNo = 1, sorts?: Sort[]) => new PagerImpl(pageSize, pageNo, sorts);
export const defaultPager = () => new PagerImpl(DEFAULT_PAGE_SIZE, 1);
export const defaultMaxPager = () => new PagerImpl(100, 1);
export const noPager = () => new PagerImpl(Infinity, 1);
export const isNotPager = (pager: Pager) => pager.pageSize === Infinity || isNaN(pager.pageSize)

/**
 * 分页结果
 */
export interface Pagination {
  pageSize: number;
  pageNo: number;
  sorts?: Sort[];
  pageCount?: number;
  recordCount?: number;
  from?: number;
  to?: number;
}
export const NO_PAGINATION: Pagination = { pageSize: Infinity, pageNo: 1 };

/// 分页的数据，包含一个列表和分页结果
///
export interface PagedList<T> {
  /// 本页数据集
  list: T[];

  /// 分页信息
  pagination: Pagination;
}

export function pagedList<T>(list: T[], pagination: Pagination): PagedList<T> {
  return {
    list,
    pagination
  }
}
export function emptyPagedList<T>(): PagedList<T> {
  return {
    list: [],
    pagination: {
      pageSize: DEFAULT_PAGE_SIZE,
      pageNo: 1,
      recordCount: 0,
      sorts: []
    }
  }
}
export const isPagedList = (model: unknown): model is object => {
  return isObject(model) && Object.prototype.hasOwnProperty.call(model, 'list') && Object.prototype.hasOwnProperty.call(model, 'pagination')
}
export function assignPagedList<T>(model: PagedList<T>, pagedList: PagedList<T>) {
  model.list.splice(0, Infinity, ...pagedList.list);
  model.pagination.pageCount = pagedList.pagination.pageCount;
  model.pagination.pageSize = pagedList.pagination.pageSize;
  model.pagination.pageNo = pagedList.pagination.pageNo;
  model.pagination.from = pagedList.pagination.from;
  model.pagination.to = pagedList.pagination.to;
  model.pagination.recordCount = pagedList.pagination.recordCount;
  model.pagination.sorts = pagedList.pagination.sorts;
}

const stringifySort = (sort: Sort) => `${sort.sortBy} ${sort.sortOrder}`
const stringifySorts = (sorts?: Sort[]) => {
  let sortStr = '';
  if (sorts && sorts.length > 0)
    sortStr = sorts.filter(s => s.sortBy).map(s => stringifySort(s)).join(',');
  return sortStr;
}
const stringifyPager = (pager: Pager) => {
  return `pageSize=${pager.pageSize}&pageNo=${pager.pageNo}&sort=${stringifySorts(pager.sorts)}`;
}
const jsonizePager = (pager: Pager) => {
  return {
    pageSize: pager.pageSize,
    pageNo: pager.pageNo ?? 1,
    sort: stringifySorts(pager.sorts)
  }
}

export const Paginator = {
  sort: SortCtor,
  parseSort: SortImpl.parse,
  pager: PagerCtor,
  pagerToString: stringifyPager,
  pagerToJson: jsonizePager,
  pagerFromJson: PagerImpl.fromJSON,
  pagedList,
}
