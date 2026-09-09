/**
 * 单/多对象视图名与解析。无 Vue、无 vue-router。
 */
import { isNumber, isString } from '../utils/is'
import { parseSorts, PagerCtor } from '../models/pagination'
import type { EntitySearchParam } from '../models/entity_search'
import type { UiDialogProps } from './builder/dialog'

export const UI_CREATE = 'create'
export const UI_SEARCH = 'search'

export function resolveViewProp(
  routeParam: string | string[],
  attr: unknown,
  prop?: string,
  defaultValue?: string,
): string | undefined {
  if (routeParam && isString(routeParam)) return routeParam
  else if (attr && isString(attr)) return attr
  else if (prop) return prop
  else return defaultValue
}

export function resolveViewPropBool(
  routeParam: string | string[],
  attr: unknown,
  prop?: boolean,
  defaultValue?: boolean,
): boolean {
  if (routeParam && isString(routeParam)) return !!routeParam
  else if (attr && isString(attr)) return !!attr
  else if (prop !== undefined) return prop
  else return defaultValue
}

export function resolveViewPropNumber(
  routeParam: string | string[],
  attr: unknown,
  prop?: number,
  defaultValue?: number,
): number | undefined {
  if (routeParam && isString(routeParam)) {
    const n = +routeParam
    if (isNumber(n)) return n
  } else if (attr) {
    const n = +attr
    if (isNumber(n)) return n
  } else if (prop) return prop
  else return defaultValue
}

/** 界面单个对象视图：详情、编辑、新建、查询 */
export enum UiViewOne {
  Details = 'details',
  Edit = 'edit',
  Create = 'create',
  Search = 'search',
}

export type UiViewOneType = (typeof UiViewOne)[keyof typeof UiViewOne]

const UiViewOneArray: string[] = Object.values(UiViewOne)
export const isViewOne = (viewType: string) =>
  UiViewOneArray.includes(viewType)

export function resolveViewOneType(
  routeView: string | string[],
  attrView: unknown,
  propView?: UiViewOneType,
): UiViewOneType {
  const viewType = resolveViewProp(routeView, attrView, propView)
  if (isViewOne(viewType)) return viewType as UiViewOneType
  return UiViewOne.Details
}

export interface UiViewOneProps {
  id?: string
  view?: UiViewOneType
}

/** 界面多个对象视图：索引、单选、多选、批量改 */
export enum UiViewMany {
  Index = 'index',
  SelectOne = 'selectOne',
  SelectMany = 'selectMany',
  EditMany = 'editMany',
}

export type UiViewManyType = (typeof UiViewMany)[keyof typeof UiViewMany]

export enum UiViewManyKind {
  list = 'list',
  categoryList = 'categoryList',
  treeGrid = 'treeGrid',
  gantt = 'gantt',
  scheduler = 'scheduler',
}

const UiViewManyArray: string[] = Object.values(UiViewMany)
export const isViewMany = (viewType: string) =>
  UiViewManyArray.includes(viewType)

export function resolveViewManyType(
  routeView: string | string[],
  attrView: unknown,
  propView?: UiViewManyType,
): UiViewManyType {
  const viewType = resolveViewProp(routeView, attrView, propView)
  if (isViewMany(viewType)) return viewType as UiViewManyType
  return UiViewMany.Index
}

export interface UiViewManyProps {
  view?: UiViewManyType
  viewKind?: UiViewManyKind
  pageSize?: number
  pageNo?: number
  sort?: string
  showFilters?: boolean
  searchWord?: string
  queryParams?: Record<string, any>
}

export function resolveSearchParam(
  viewProps: UiViewManyProps,
): EntitySearchParam {
  const { pageSize, pageNo, sort, searchWord, queryParams } = viewProps
  const pager = PagerCtor(pageSize, pageNo, parseSorts(sort))
  return {
    pager,
    searchWord,
    queryParams,
  }
}

export type UiViewType = UiViewOneType | UiViewManyType

/** 移动端列表项展示约定（无框架依赖）。 */
export interface UniListViewProps {
  titleKey?: string
  subtitle?: string | ((data: any) => string) | undefined
  subtitleKey?: string
  noteKey?: string
  thumbKey?: string
  thumbSize?: string
  showImage?: boolean
  imageKey?: string
  showSearch?: boolean
}

export interface UiViewProps {
  showToolbar?: boolean
  primaryCols?: 2 | 3
  showBreadcrumb?: boolean
  showActions?: boolean
  showGroupActions?: boolean
  showSecondaryGroup?: boolean
  showAttachments?: boolean
  dialogs?: UiDialogProps[]
}
