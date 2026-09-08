import type { Router } from "vue-router";
import type { I18n } from "vue-i18n";
import { translateMessage } from "../i18n/i18n";
import type { WatchCallback, WatchOptions } from "vue";
import {
  EntityLogic,
  MetaModel,
  NO_PAGINATION,
  MetaUiFieldLogic,
  MetaUiGroupLogic,
  getSqlOperator,
  type Entity,
  type EntityAction,
  type EntityCtor,
  type EntityLogicInit,
  type EntitySearchParam,
  type EntityUrlParam,
  type MetaUiGroup,
  type Predicate,
  type SelectableFn,
  type UiContext,
  type UiValidation,
} from "@mmda/core";
import { rx } from "../rx";
import { UiCustomSearchField, UiSearchField } from "../ui/factory/filter";
import type { UniListViewProps } from "../app/state";
import { createDefaultSearchParam, type UiViewPropsType, type UiViewType } from "../contexts/view";
import type { VueUiContext } from "../contexts/vue_ui_context";
import type { UiListViewPropsType } from "../ui/builder/list_view";
import type { UiTreeListViewPropsType } from "../ui/factory/tree_category_list";
import type { UiGanttViewProps } from "../ui/factory/gantt";

export { EntityLogic, type EntityLogicInit };

export type UiViewOption =
  | UiListViewPropsType<any>
  | UiTreeListViewPropsType<any>
  | UiGanttViewProps
  | UiViewPropsType;

export type UiViewOptions = Partial<
  Record<UiViewType, (ctx: UiContext) => UiViewOption>
>;

export interface UiSearchForm {
  searchParam?: EntitySearchParam;
  queryParams?: Record<string, any>;
  searchFields: Array<UiSearchField>;
  customSearchFields: Array<UiCustomSearchField>;
}

export type BoolFn = () => boolean;

export interface WatchFn {
  cb: WatchCallback;
  options?: WatchOptions<false>;
}

export const beforeView = (viewType: string) =>
  `before${viewType.firstLetterUpper()}`;
export const clearView = (viewType: string) =>
  `clear${viewType.firstLetterUpper()}Logic`;

export type UiLogicFnResult<E> = {
  fields: MetaUiFieldLogic<E>[];
  groups: MetaUiGroupLogic<E, any>[];
  customActions: EntityAction[];
};
export type UiLogicFn<E> = () => UiLogicFnResult<E>;
export type UiViewLogicModule<E> =
  UiLogicFn<E> | Record<string, UiLogicFn<E> | unknown>;
export type UiViewLogicLoader<E> = () => Promise<UiViewLogicModule<E>>;

export type UiLogicBeforeFn<E> = (
  context: UiContext,
  model?: E,
  ...args: any[]
) => Promise<boolean>;
export type UiLogicAfterFn<E> = (
  context: UiContext,
  model: E,
  action?: EntityAction,
  apiResultOrError?: unknown,
) => any;
export type UiLogicManyBeforeFn<E> = (
  context: UiContext,
  models: E[],
  ...args: any[]
) => Promise<boolean>;
export type UiLogicManyAfterFn<E> = (
  context: UiContext,
  models: E[],
  ...args: any[]
) => void;

export interface UiLogicInit extends EntityLogicInit {
  router?: Router | any;
  i18n?: I18n;
}

export abstract class UiLogic<E extends Entity> extends EntityLogic<E> {
  listViewProps?: UniListViewProps;
  readonly router?: Router | any;
  viewLogicLoaders: Partial<Record<UiViewType, UiViewLogicLoader<E>>> = {};
  viewOptions?: UiViewOptions;

  private readonly relativeLogics: Record<
    string,
    (master: E) => UiGroupLogic<any, E>
  >;
  private searchForm?: UiSearchForm;

  private editFields?: MetaUiFieldLogic<E>[];
  private editGroups?: MetaUiGroupLogic<E, any>[];
  private editActions?: EntityAction[];
  private detailsFields?: MetaUiFieldLogic<E>[];
  private detailsGroups?: MetaUiGroupLogic<E, any>[];
  private detailsActions?: EntityAction[];
  private listFields?: MetaUiFieldLogic<E>[];
  private listGroups?: MetaUiGroupLogic<E, any>[];
  private listActions?: EntityAction[];
  private selectManyFields?: MetaUiFieldLogic<E>[];
  private selectManyGroups?: MetaUiGroupLogic<E, any>[];
  private selectManyActions?: EntityAction[];
  private readonly loadingViewLogics = new Map<UiViewType, Promise<void>>();

  beforeLoad?: UiLogicBeforeFn<E>;
  afterLoad?: UiLogicAfterFn<E>;
  beforeValidate?: UiLogicBeforeFn<E>;
  afterValidate?: (
    context: UiContext,
    model: E,
    validation: UiValidation,
  ) => Promise<number>;
  beforeSave?: UiLogicBeforeFn<E>;
  afterSave?: UiLogicAfterFn<E>;
  beforeImport?: UiLogicBeforeFn<E>;
  afterImport?: UiLogicAfterFn<E>;
  beforePrint?: UiLogicBeforeFn<E>;
  afterPrint?: UiLogicAfterFn<E>;
  beforeUpload?: UiLogicBeforeFn<E>;
  afterUpload?: UiLogicAfterFn<E>;
  beforeAction?: UiLogicBeforeFn<E>;
  afterAction?: UiLogicAfterFn<E>;
  beforeDelete?: UiLogicBeforeFn<E>;
  afterDelete?: UiLogicAfterFn<E>;
  beforeDeleteAll?: UiLogicManyBeforeFn<E>;
  afterDeleteAll?: UiLogicManyAfterFn<E>;
  beforeResetFilters?: UiLogicManyBeforeFn<E>;
  afterResetFilters?: UiLogicManyAfterFn<E>;
  groupActionVisibles?: Record<string, Record<string, Predicate>>;
  selectableList?: Record<string, SelectableFn<E>>;

  get logicFields() {
    return this.editFields || this.detailsFields || this.listFields || [];
  }

  getLogicField(fieldName: string) {
    return this.logicFields.find((field) => field.field.fieldName === fieldName)
      ?.field;
  }

  get searchParams() {
    const fields = Object.fromEntries(
      (this.searchForm?.searchFields ?? []).map((field) => [
        field.field.fieldName,
        field.hasVal
          ? (getSqlOperator(field.currentOp)?.toSQL(field.searchValue) ?? "")
          : "",
      ]),
    );
    const custom = Object.fromEntries(
      (this.searchForm?.customSearchFields ?? []).map((field) => [
        field.searchParam,
        field.hasVal ? field.searchValue : "",
      ]),
    );
    return { ...fields, ...custom };
  }

  constructor(createEntity: EntityCtor<E>, init: UiLogicInit) {
    super(createEntity, init);
    this.router = init.router;
    this.relativeLogics = {};
  }

  addRelativeLogic<R extends Entity>(
    name: string,
    logicCreator: (master: E) => UiGroupLogic<R, E>,
  ) {
    this.relativeLogics[name] = logicCreator;
  }

  createRelativeLogic<R extends Entity>(name: string, master: E) {
    const logicCreator = this.relativeLogics[name];
    return logicCreator ? (logicCreator(master) as UiGroupLogic<R, E>) : null;
  }

  getLogicFn(
    view: UiViewType,
    type: "before" | "clear" = "before",
  ): UiLogicFn<E> {
    return (this as any)[
      type === "before" ? beforeView(view) : clearView(view)
    ];
  }

  private resolveLogicView(view: UiViewType): UiViewType {
    if (view === "create" || view === "editMany") return "edit";
    if (view === "selectOne") return "index";
    if (
      view === "selectMany" &&
      !this.viewLogicLoaders.selectMany &&
      this.beforeSelectMany === UiLogic.prototype.beforeSelectMany
    ) {
      return "index";
    }
    return view;
  }

  async ensureViewLogic(view: UiViewType): Promise<UiViewType> {
    const logicView = this.resolveLogicView(view);
    const loader = this.viewLogicLoaders[logicView];
    if (!loader) return logicView;

    let loading = this.loadingViewLogics.get(logicView);
    if (!loading) {
      loading = loader().then((loaded) => {
        const methodName = beforeView(logicView);
        if (typeof loaded === "function") {
          (this as any)[methodName] = loaded;
          return;
        }
        const method = loaded[methodName];
        if (typeof method === "function") {
          (this as any)[methodName] = method;
        }
      });
      this.loadingViewLogics.set(logicView, loading);
    }
    await loading;
    return logicView;
  }

  field(fldName: string) {
    const metaUi = this.meta?.metaUi;
    if (!metaUi) {
      throw new Error(
        translateMessage("invalid.logicNoMetaField", {
          repository: this.repository,
          field: fldName,
        }),
      );
    }
    const field = metaUi.getField(fldName);
    if (!field) {
      throw new Error(
        translateMessage("invalid.logicMissingField", {
          repository: this.repository,
          field: fldName,
        }),
      );
    }
    return new MetaUiFieldLogic<E>(field);
  }

  group<G>(groupName: string) {
    const metaUi = this.meta?.metaUi;
    if (!metaUi) {
      throw new Error(
        translateMessage("invalid.logicNoMetaGroup", {
          repository: this.repository,
          group: groupName,
        }),
      );
    }
    const group = metaUi.getGroup(groupName);
    if (!group) {
      throw new Error(
        translateMessage("invalid.logicMissingGroup", {
          repository: this.repository,
          group: groupName,
        }),
      );
    }
    return new MetaUiGroupLogic<E, G>(group);
  }

  beforeSearch(): UiSearchForm {
    return (this.searchForm ??= {
      searchParam: rx(createDefaultSearchParam()),
      queryParams: rx({}),
      searchFields: [],
      customSearchFields: [],
    });
  }

  beforeEdit(): UiLogicFnResult<E> {
    this.editFields ??= [];
    this.editGroups ??= [];
    this.editActions ??= [];
    return {
      fields: this.editFields,
      groups: this.editGroups,
      customActions: this.editActions,
    };
  }

  clearEditLogic() {
    this.editFields = [];
    this.editGroups = [];
    this.editActions = [];
  }

  beforeDetails(): UiLogicFnResult<E> {
    this.detailsFields ??= [];
    this.detailsGroups ??= [];
    this.detailsActions ??= [];
    return {
      fields: this.detailsFields,
      groups: this.detailsGroups,
      customActions: this.detailsActions,
    };
  }

  clearDetailsLogic() {
    this.detailsFields = [];
    this.detailsGroups = [];
    this.detailsActions = [];
  }

  beforeIndex(): UiLogicFnResult<E> {
    this.listFields ??= [];
    this.listGroups ??= [];
    this.listActions ??= [];
    return {
      fields: this.listFields,
      groups: this.listGroups,
      customActions: this.listActions,
    };
  }

  clearIndexLogic() {
    this.listFields = [];
    this.listGroups = [];
    this.listActions = [];
  }

  beforeSelectMany(): UiLogicFnResult<E> {
    this.selectManyFields ??= [];
    this.selectManyGroups ??= [];
    this.selectManyActions ??= [];
    return {
      fields: this.selectManyFields,
      groups: this.selectManyGroups,
      customActions: this.selectManyActions,
    };
  }

  clearSelectManyLogic() {
    this.selectManyFields = [];
    this.selectManyGroups = [];
    this.selectManyActions = [];
  }

  async applyTo(context: VueUiContext<any>, view: UiViewType = "edit") {
    const logicView = await this.ensureViewLogic(view);
    const fn = this.getLogicFn(logicView);
    if (!fn) return;
    const { fields, groups, customActions } = fn.call(this);
    context.bindLogics(fields, groups, customActions);
  }
}

/** 无定制字段逻辑时的默认实现，供通用 CRUD 页与跨服务 select 使用 */
export class GenericUiLogic<E extends Entity = Entity> extends UiLogic<E> {}

export class UiGroupLogic<
  G extends Entity,
  P extends Entity,
> extends UiLogic<G> {
  items: G[];
  metaUiGroup: MetaUiGroup;

  constructor(
    defineGroupItem: EntityCtor<G>,
    public readonly parent: UiLogic<P>,
    public readonly master: P,
    public readonly groupName: string,
  ) {
    const { meta, metaUiService, module, router } = parent;
    const metaUiGroup = meta.metaUi.getGroup(groupName)!;
    super(defineGroupItem, {
      module,
      meta: { metaUi: metaUiGroup.groupUi! },
      metaUiService: metaUiService,
      repository: groupName,
      router,
      isChild: true,
      apiService: parent.apiService,
    });
    this.items = master[groupName] ?? [];
    this.metaUiGroup = metaUiGroup;
  }

  getAll() {
    return Promise.resolve({
      pagination: NO_PAGINATION,
      list: this.items,
    });
  }

  create(param?: any) {
    this.createParam = param;
    return Promise.resolve(
      MetaModel.createEntity(this.meta.metaUi, this.createEntity, param),
    );
  }

  load(id: any) {
    const e = this.items.find((it: any) => it.id == id);
    return e ? Promise.resolve(e) : Promise.reject(Error(`${id} not found`));
  }

  delete(id: any) {
    const idx = this.items.findIndex((it: any) => it.id == id);
    if (idx >= 0)
      return Promise.resolve(MetaModel.deleteItemByIndex(this.items, idx));
    return Promise.reject(Error(`${id} not found`));
  }

  save(child: G) {
    const idx = this.items.findIndex((it: any) => it.id == child.id);
    if (idx >= 0) Object.assign(this.items[idx], child);
    else {
      Object.entries(this.metaUiGroup.joinFields ?? {}).forEach(([k, v]) => {
        (child as any)[k] = this.master[v];
      });
      this.items.push(child);
    }
    return Promise.resolve(1);
  }

  async initMetadata(reload = false, params?: EntityUrlParam) {
    if (params?.redirection) {
      this.meta = await this.metaUiService.getPack(
        Object.assign(
          {},
          { repository: this.repository, service: this.apiService },
          params,
        ),
        reload,
      );
    } else {
      this.metaUiGroup = this.parent.meta.metaUi.getGroup(this.groupName)!;
      this.meta = { metaUi: this.metaUiGroup.groupUi! };
    }
    return this.meta;
  }
}
