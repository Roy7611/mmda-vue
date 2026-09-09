import type { VNode, VNodeChild } from 'vue'
import {
  DEFAULT_PAGE_SIZE,
  defaultSearchParam,
  resolveViewManyType,
  resolveViewOneType,
  resolveViewProp,
  resolveViewPropBool,
  resolveViewPropNumber,
  type EntitySearchParam,
  type UiProps,
  type UiViewManyProps,
  type UiViewOneProps,
  type UiViewProps,
} from '@mmda/core'
import type { RouteParams } from 'vue-router'
import { readStoredPageSize } from '../app/theme'

export {
  UI_CREATE,
  UI_SEARCH,
  resolveViewProp,
  resolveViewPropBool,
  resolveViewPropNumber,
  UiViewOne,
  isViewOne,
  resolveViewOneType,
  UiViewMany,
  UiViewManyKind,
  isViewMany,
  resolveViewManyType,
  resolveSearchParam,
  type UiViewOneType,
  type UiViewOneProps,
  type UiViewManyType,
  type UiViewManyProps,
  type UiViewType,
  type UiViewProps,
} from '@mmda/core'

export type ChildSlot = (...args: any[]) => VNodeChild

export function resolveViewOneProps(
  routeParam: RouteParams,
  attrs: UiProps,
  props?: any,
): UiViewOneProps {
  return {
    id: resolveViewProp(routeParam.id, attrs.id, props?.id, '_'),
    view: resolveViewOneType(routeParam.view, attrs.view, props?.view),
  }
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
  } = attrs ?? {}
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
    queryParams: Object.assign(routeParam.queryParams ?? {}, queryParams),
  }
}

/** 列表默认搜索参数：pager.pageSize 使用本地偏好 `mmda/pageSize` */
export function createDefaultSearchParam(searchWord = ''): EntitySearchParam {
  const param = defaultSearchParam(searchWord)
  param.pager.pageSize = readStoredPageSize()
  return param
}

export interface UiViewSlot {
  sort?: number
  node: VNode
}
export interface UiViewSlots {
  toolbar?: () => VNodeChild
  header?: () => VNodeChild
  footer?: () => VNodeChild
  qrCode?: () => VNode
  slots?: Array<UiViewSlot>
}
export type UiViewPropsType = UiViewProps & UiViewSlots & UiProps
