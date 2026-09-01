import type { VNode, VNodeChild } from "vue";
import { parseSorts, isString, isNumber, PagerCtor, DEFAULT_PAGE_SIZE, defaultSearchParam } from "@mmda/core";
import type { EntitySearchParam } from "@mmda/core";
import type { RouteParams } from "vue-router";
import type { PropData } from "./ui_layout";
import type { UiDialogPropsType } from "./ui_dialog";
import { readStoredPageSize } from "./ui_theme";

export type ChildSlot = (...args: any[]) => VNodeChild;
export const UI_CREATE = "create";
export const UI_SEARCH = "search";

export function resolveViewProp(
  routeParam: string | string[],
  attr: unknown,
  prop?: string,
  defaultValue?: string,
): string | undefined {
  if (routeParam && isString(routeParam)) return routeParam;
  else if (attr && isString(attr)) return attr;
  else if (prop) return prop;
  else return defaultValue;
}
export function resolveViewPropBool(
  routeParam: string | string[],
  attr: unknown,
  prop?: boolean,
  defaultValue?: boolean,
): boolean {
  if (routeParam && isString(routeParam)) return !!routeParam;
  else if (attr && isString(attr)) return !!attr;
  else if (prop !== undefined) return prop;
  else return defaultValue;
}
export function resolveViewPropNumber(
  routeParam: string | string[],
  attr: unknown,
  prop?: number,
  defaultValue?: number,
): number | undefined {
  if (routeParam && isString(routeParam)) {
    const n = +routeParam;
    if (isNumber(n)) return n;
  } else if (attr) {
    const n = +attr;
    if (isNumber(n)) return n;
  } else if (prop) return prop;
  else return defaultValue;
}

//#region 单对象视图
/**
 * 界面单个对象视图类型，包括详情、编辑、查询
 */
export enum UiViewOne {
  Details = "details",
  Edit = "edit",
  Create = "create",
  Search = "search",
}
export type UiViewOneType = "details" | "edit" | "create" | "search"; //| keyof typeof UiViewOne;

const UiViewOneArray: string[] = Object.values(UiViewOne);
export const isViewOne = (viewType: string) =>
  UiViewOneArray.includes(viewType);
export function resolveViewOneType(
  routeView: string | string[],
  attrView: unknown,
  propView?: UiViewOneType,
): UiViewOneType {
  const viewType = resolveViewProp(routeView, attrView, propView);
  if (isViewOne(viewType)) return viewType as UiViewOneType;
  else return UiViewOne.Details;
}
export interface UiViewOneProps {
  id?: string;
  view?: UiViewOneType;
}

export function resolveViewOneProps(
  routeParam: RouteParams,
  attrs: PropData,
  props?: any,
): UiViewOneProps {
  return {
    id: resolveViewProp(routeParam.id, attrs.id, props?.id, "_"),
    view: resolveViewOneType(routeParam.view, attrs.view, props?.view),
  };
}

//#endregion of 单对象视图

//#region 多对象视图
/**
 * 界面多个对象视图类型，包括索引、单选、多选列表和批量修改列表
 */
export enum UiViewMany {
  Index = "index",
  SelectOne = "selectOne",
  SelectMany = "selectMany",
  EditMany = "editMany",
}
export type UiViewManyType = "index" | "selectOne" | "selectMany" | "editMany"; //keyof typeof UiViewMany
const UiViewManyArray: string[] = Object.values(UiViewMany);
export const isViewMany = (viewType: string) =>
  UiViewManyArray.includes(viewType);
export function resolveViewManyType(
  routeView: string | string[],
  attrView: unknown,
  propView: any,
): UiViewManyType {
  const viewType = resolveViewProp(routeView, attrView, propView);
  if (isViewMany(viewType)) return viewType as UiViewManyType;
  return UiViewMany.Index;
}

export interface UiViewManyProps {
  view?: UiViewManyType;
  pageSize?: number;
  pageNo?: number;
  sort?: string;
  showFilters?: boolean;
  searchWord?: string;
  queryParams?: Record<string, any>;
}

export function resolveViewManyProps(
  routeParam: RouteParams,
  attrs: Record<string, unknown>,
  props: Readonly<UiViewManyProps>,
  defaultPageSize: number = readStoredPageSize(DEFAULT_PAGE_SIZE),
): UiViewManyProps {
  const {
    view,
    pageSize,
    pageNo,
    sort,
    showFilters,
    filter,
    searchWord,
    ...queryParams
  } = attrs ?? {};
  return {
    view: resolveViewManyType(routeParam.view, view, props.view),
    pageNo: resolveViewPropNumber(routeParam.pageNo, pageNo, props.pageNo, 1),
    pageSize: resolveViewPropNumber(
      routeParam.pageSize,
      pageSize,
      props.pageSize,
      defaultPageSize,
    ),
    sort: resolveViewProp(routeParam.sort, sort, props.sort),
    showFilters: resolveViewPropBool(
      routeParam.showFilters,
      showFilters,
      props.showFilters,
      false,
    ),
    searchWord: resolveViewProp(
      routeParam.searchWord,
      searchWord,
      props.searchWord,
    ),
    // queryParams,
    queryParams: Object.assign(routeParam.queryParams ?? {}, queryParams),
  };
}
export function resolveSearchParam(
  viewProps: UiViewManyProps,
): EntitySearchParam {
  const { pageSize, pageNo, sort, searchWord, queryParams } = viewProps;
  const pager = PagerCtor(pageSize, pageNo, parseSorts(sort));
  return {
    pager,
    searchWord,
    queryParams,
  };
}

/** 列表默认搜索参数：pager.pageSize 使用本地偏好 `mmda/pageSize` */
export function createDefaultSearchParam(searchWord = ""): EntitySearchParam {
  const param = defaultSearchParam(searchWord);
  param.pager.pageSize = readStoredPageSize();
  return param;
}
//#endregion of 多对象视图

/**
 * 界面视图类型
 */
export type UiViewType = UiViewOneType | UiViewManyType;

//#region view props
export interface UiViewProps {
  showToolbar?: boolean;
  stickyToolbar?: boolean;
  primaryCols?: 2 | 3;
  showBreadcrumb?: boolean;
  showActions?: boolean;
  showGroupActions?: boolean; //分组操作是否显示
  showSecondaryGroup?: boolean; //是否显示右边辅助栏
  showAttachments?: boolean;
  dialogs?: UiDialogPropsType[];
}

export interface UiViewSlot {
  sort?: number;
  node: VNode;
}
export interface UiViewSlots {
  toolbar?: () => VNodeChild;
  header?: () => VNodeChild;
  footer?: () => VNodeChild;
  qrCode?: () => VNode;
  slots?: Array<UiViewSlot>;
}
export type UiViewPropsType = UiViewProps & UiViewSlots & PropData;
//#endregion

//#region Qcode props
export interface QrcodeProps {
  codeValue: string;
  qrCodefooter?: VNode;
  onlyQrcode?: boolean;
  onlyBarcode?: boolean;
}
//#endregion
/**
 * 变更类型
 *
 * 0;NONE;-|1;CHANGED;修改|2;ADDED;增项|4;REMOVED;减项
 *
 */
export const enum ChangeType {
  //#region ~GENERATED PARTS BEGIN
  NONE = "NONE", //0 -
  CHANGED = "CHANGED", //1 修改
  ADDED = "ADDED", //2 增项
  REMOVED = "REMOVED", //4 减项
}
//#endregion
