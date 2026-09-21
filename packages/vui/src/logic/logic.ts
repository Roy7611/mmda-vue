import type { WatchCallback, WatchOptions } from "vue";
import {
  EntityLogic,
  SubEntityLogic,
  beforeView,
  type EntityCustomSearchField,
  type EntityLogicInit,
  type EntitySearchParam,
  type UiLogicAfterFn,
  type UiLogicBeforeFn,
  type UiLogicFn,
  type UiLogicFnResult,
  type UiManyLogicAfterFn,
  type UiManyLogicBeforeFn,
  type UiLogicFnAsyncLoader,
  type UiLogicFnResultSet,
  type UiViewOptions,
} from "@mmda/core";
import { UiCustomSearchField, UiSearchField } from "../ui/factory/filter";

export {
  EntityLogic,
  SubEntityLogic,
  beforeView,
  type EntityCustomSearchField,
  type EntityLogicInit,
  type EntitySearchParam,
  type UiLogicFnResult,
  type UiLogicFn,
  type UiLogicFnResultSet,
  type UiLogicFnAsyncLoader,
  type UiLogicBeforeFn,
  type UiLogicAfterFn,
  type UiManyLogicBeforeFn,
  type UiManyLogicAfterFn,
  type UiViewOptions,
};

/** vui 侧搜索表单：搜索状态由 UI 上下文持有，业务只提供自定义字段声明。 */
export interface VueUiSearchForm {
  searchParam?: EntitySearchParam;
  queryParams?: Record<string, unknown>;
  searchFields: Array<UiSearchField>;
  customSearchFields: Array<UiCustomSearchField | EntityCustomSearchField>;
}

export interface WatchFn {
  cb: WatchCallback;
  options?: WatchOptions<false>;
}
