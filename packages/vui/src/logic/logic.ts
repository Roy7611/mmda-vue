import type { WatchCallback, WatchOptions } from "vue";
import {
  EntityLogic,
  SubEntityLogic,
  beforeView,
  clearView,
  type Entity,
  type EntityCtor,
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

/** @deprecated 使用 EntityLogicInit；不再含 router / i18n。 */
export type UiLogicInit = EntityLogicInit;

/** @deprecated 使用 EntityLogic；业务应 extends EntityLogic。 */
export const UiLogic = EntityLogic;
/** @deprecated 使用 EntityLogic。 */
export type UiLogic<E extends Entity> = EntityLogic<E>;

export interface UiSearchForm extends EntitySearchForm {
  searchFields: Array<UiSearchField>;
  customSearchFields: Array<UiCustomSearchField>;
}

export type BoolFn = () => boolean;

export interface WatchFn {
  cb: WatchCallback;
  options?: WatchOptions<false>;
}

/**
 * vui 专用：搜索表单响应式包装。业务类不要继承本类。
 * 路由挂在 VueUiContext / app，不在 Logic 上。
 */
export abstract class VueEntityLogic<E extends Entity> extends EntityLogic<E> {
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

/** 无定制字段逻辑时的默认实现，供通用 CRUD 页与跨服务 select 使用 */
export class GenericUiLogic<E extends Entity = Entity> extends VueEntityLogic<E> {
  constructor(createEntity: EntityCtor<E>, init: EntityLogicInit) {
    super(createEntity, init);
  }
}
