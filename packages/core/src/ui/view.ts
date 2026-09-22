/**
 * 单/多对象视图名与解析。无 Vue、无 vue-router。
 */
import { isNumber, isString } from '../utils/is'
import { parseSorts, PagerCtor } from '../models/pagination'
import type { EntitySearchParam } from '../models/entity_search'
import type { UiDialogProps } from './builder/dialog'

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
  else return defaultValue ?? false
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
  if (viewType && isViewOne(viewType)) return viewType as UiViewOneType
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
  if (viewType && isViewMany(viewType)) return viewType as UiViewManyType
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
  const pager = PagerCtor(pageSize, pageNo, parseSorts(sort ?? ''))
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

import type { UiProps } from './props'
/**
 * 单对象实体屏（details / edit / create）拼屏 extras。
 * 不要塞 selectionMode / showSearchbar（那是 {@link import('./builder/list_view').UiListViewProps}）。
 */
export interface UiViewProps extends UiProps {
  /** 是否显示模块工具栏。缺省 true。 */
  showToolbar?: boolean
  /** 主表字段组列数。 */
  primaryCols?: 2 | 3
  /**
   * 详情页壳。缺省 `cards`（左右卡）。
   * `tabs`：emphasized 只读顶栏 + 每 ui group 一页签。
   */
  pageLayout?: 'cards' | 'tabs'
  showBreadcrumb?: boolean
  showActions?: boolean
  showGroupActions?: boolean
  showSecondaryGroup?: boolean
  showAttachments?: boolean
  dialogs?: UiDialogProps[]
}

import type { MmdaApplication } from '../mmda_app'
import type { UiRenderer } from './renderer'
import type { UiRouter } from './router'
import type { UiContext } from './context'

/**
 * 宿主（视图层）交给业务页面视图的依赖。业务页面因此不 import 任何框架：
 * 数据 / 翻译 / 控件工厂来自 `app`，壳节点走 `render`，跳转走 `router`。
 */
export interface UiViewDeps<TNode = unknown> {
  /** 应用壳：`state` / `modules` / `user` / `ui`（UiBuilder）/ `translate`。 */
  app: MmdaApplication
  /** 最底层渲染函数：Vue 是 `h()`，React 是 `createElement`。 */
  render: UiRenderer<TNode>['render']
  /** 路由适配：`resolve` 出 href、`push` 跳转（业务不 import vue-router）。 */
  router: UiRouter
}

/**
 * 页面级视图（模块首页、占位页这类非实体屏）：给依赖，返回节点。
 * 宿主负责把返回值放进自己的响应式渲染函数里跑，业务侧不写响应式代码。
 * 泛型 `TNode` 由宿主指定（vui 传 `VNode`），所以业务包不需要知道框架类型。
 */
export type UiViewFn<TNode = unknown> = (deps: UiViewDeps<TNode>) => TNode

/**
 * 实体屏（列表 / 详情）自定义页的依赖：在 {@link UiViewDeps} 基础上多一个**该屏的会话** ——
 * 因为重页面都走 Builder 的会话接口（`builder.buildGantt(context, props)` / `buildScheduler` …）。
 * 业务包因此不 import 任何框架，也不自己 new 会话。
 */
export interface UiScreenViewDeps<TNode = unknown> extends UiViewDeps<TNode> {
  context: UiContext
}

/** 实体屏自定义页：给依赖，返回节点。宿主（vui / rui）负责包成自己的组件。 */
export type UiScreenViewFn<TNode = unknown> = (
  deps: UiScreenViewDeps<TNode>,
) => TNode
