import type { WatchCallback, WatchOptions } from "vue";
import {
  EntityLogic,
  SubEntityLogic,
  beforeView,
  clearView,
  type Entity,
  type EntityLogicInit,
  type EntitySearchForm,
  type UiLogicAfterFn,
  type UiLogicBeforeFn,
  type UiLogicFn,
  type UiLogicFnResult,
  type UiLogicManyAfterFn,
  type UiLogicManyBeforeFn,
  type UiViewLogicLoader,
  type UiViewLogicModule,
  type UiViewOptions,
} from "@mmda/core";
import { rx } from "../rx";
import { UiCustomSearchField, UiSearchField } from "../ui/factory/filter";
import { createDefaultSearchParam } from "../contexts/view";

export {
  EntityLogic,
  SubEntityLogic,
  beforeView,
  clearView,
  type EntityLogicInit,
  type EntitySearchForm,
  type UiLogicFnResult,
  type UiLogicFn,
  type UiViewLogicModule,
  type UiViewLogicLoader,
  type UiLogicBeforeFn,
  type UiLogicAfterFn,
  type UiLogicManyBeforeFn,
  type UiLogicManyAfterFn,
  type UiViewOptions,
};

export interface UiSearchForm extends EntitySearchForm {
  searchFields: Array<UiSearchField>;
  customSearchFields: Array<UiCustomSearchField>;
}

export interface WatchFn {
  cb: WatchCallback;
  options?: WatchOptions<false>;
}

/**
 * vui 壳用的默认可实例化 Logic：搜索表单 `rx`。业务类不要继承本类。
 * 无定制仓库、跨服务 select、分类树走 `new VueEntityLogic(...)`。
 * 路由挂在 VueUiContext / app，不在 Logic 上。
 */
export class VueEntityLogic<E extends Entity = Entity> extends EntityLogic<E> {
  protected createSearchForm(): UiSearchForm {
    return {
      searchParam: rx(createDefaultSearchParam()),
      queryParams: rx({}),
      searchFields: [],
      customSearchFields: [],
    };
  }

  beforeSearch(): UiSearchForm {
    return super.beforeSearch() as UiSearchForm;
  }
}
