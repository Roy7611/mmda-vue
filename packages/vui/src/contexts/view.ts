import type { VNode, VNodeChild } from 'vue'
import {
  DEFAULT_PAGE_SIZE,
  resolveViewManyType,
  resolveViewOneType,
  resolveViewProp,
  resolveViewPropBool,
  resolveViewPropNumber,
  EntitySearchParam,
  type UiProps,
  type UiViewManyProps,
  type UiViewOneProps,
  type UiViewProps,
} from '@mmda/core'
import type { RouteParams } from 'vue-router'
import { readStoredPageSize } from '../app/theme'

export {
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
  attrs: Record<string, unknown>,
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
  const param = EntitySearchParam.create(searchWord)
  param.pager.pageSize = readStoredPageSize()
  return param
}

/**
 * 实体屏（详情 / 编辑）整页 props：只吃 core 的 `UiViewProps`
 * （页级开关 + 页级插槽 toolbar / header / content / footer）。
 *
 * 原 `VuiViewSlots` 的 `qrCode` / `slots: {sort,node}[]` 全仓零消费（只有声明、没人设也没人读），
 * 且后者是「预建节点 + 排序」形态、与 core 的惰性 `UiSlot` 不一致 —— 已删；真需要时按 `UiViewSlots` 加。
 */
export type VuiViewProps = UiViewProps<VNode>
