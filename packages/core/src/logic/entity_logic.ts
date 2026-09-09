import { ApiClient, type EntityUrlParam } from "../net/api_client";
import { ApiProblem, toApiProblem } from "../net/api_problem";
import { ApiError, isApiErrorPayload, toApiError } from "../net/api_error";
import { isObject, isNullObject } from "../utils/is";
import { Entity, type EntityCtor, type EntitySearchParam, type SelectableFn } from "../models/entity";
import {
  MetaModel,
  defaultEntitySimplifyOptions,
  defineEntityArray,
  type EntitySimplifyOptions,
} from "../models/metamodel";
import type { PagedList } from "../models/pagination";
import { DEFAULT_PAGE_SIZE, NO_PAGINATION } from "../models/pagination";
import type { EntityAction } from "../metaui/metaui_action";
import type { MetaUiGroup } from "../metaui/metaui_group";
import { MetaUiFieldLogic } from "./field_logic";
import { MetaUiGroupLogic } from "./group_logic";
import type { MetaUiPack, MetaUiService } from "../metaui/metaui_service";
import type { Module } from "../metaui/module";
import type { UiContext } from "../ui/context";
import type { UiValidation } from "./validation";
import type { Predicate } from "./logic_functions";
import type { UniListViewProps, UiViewType } from "../ui/view";
import { getSqlOperator } from "./sql_operator";
import { defaultSearchParam } from "../models/entity_search";
import "../extensions/string_extensions";

export interface EntityLogicInit {
  metaUiService: MetaUiService;
  repository: string;
  meta?: MetaUiPack;
  module?: Module;
  isChild?: boolean;
  customPage?: boolean;
  /** Backend feature module name, e.g. `mes` | `base`; used by routes and API. */
  apiService?: string;
}

/** 搜索栏装配结果；searchFields 元素由 UI 壳提供（vui 为 UiSearchField）。 */
export interface EntitySearchForm {
  searchParam?: EntitySearchParam;
  queryParams?: Record<string, any>;
  searchFields: any[];
  customSearchFields: any[];
}

export type UiViewOptions = Partial<
  Record<UiViewType, (ctx: UiContext) => Record<string, any>>
>;

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
  | UiLogicFn<E>
  | Record<string, UiLogicFn<E> | unknown>;
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

/**
 * Entity Logic：ApiClient + MetaModel CRUD + 视图钩子装配。无 Vue。
 *
 * Data 通道：
 * - 实体 CRUD / 动作：用本类方法或 `this.apiClient`。
 * - `context.apiClient` 与 `this.apiClient` 同一实例。
 * - 面向用户文案用 `context.t()`（vui 由 VueUiContext 实现）。
 */
export abstract class EntityLogic<E extends Entity> {
  meta: MetaUiPack;
  module?: Module;
  createParam: any;
  readonly metaUiService: MetaUiService;
  readonly apiClient: ApiClient;
  readonly repository: string;
  readonly isChild: boolean;
  readonly customPage: boolean;
  readonly apiService?: string;

  listViewProps?: UniListViewProps;
  viewLogicLoaders: Partial<Record<UiViewType, UiViewLogicLoader<E>>> = {};
  viewOptions?: UiViewOptions;

  private readonly relativeLogics: Record<
    string,
    (master: E) => SubEntityLogic<any, E>
  >;
  private searchForm?: EntitySearchForm;

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

  constructor(
    public readonly createEntity: EntityCtor<E>,
    init: EntityLogicInit,
  ) {
    this.metaUiService = init.metaUiService;
    this.repository = init.repository;
    this.meta = init.meta ?? ({ metaUi: undefined } as any);
    this.module = init.module;
    this.isChild = init.isChild ?? false;
    this.customPage = init.customPage ?? false;
    this.apiService = init.apiService;
    this.apiClient = this.metaUiService.getApiClient(this.repository);
    this.relativeLogics = {};
  }

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

  addRelativeLogic<R extends Entity>(
    name: string,
    logicCreator: (master: E) => SubEntityLogic<R, E>,
  ) {
    this.relativeLogics[name] = logicCreator;
  }

  createRelativeLogic<R extends Entity>(name: string, master: E) {
    const logicCreator = this.relativeLogics[name];
    return logicCreator ? (logicCreator(master) as SubEntityLogic<R, E>) : null;
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
      this.beforeSelectMany === EntityLogic.prototype.beforeSelectMany
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

  getModelTitle(model: E) {
    const metaUi = this.meta.metaUi;
    if (!metaUi) return model.id;
    return `${metaUi.displayLabel}?${metaUi.uniqueKey ? model[metaUi.uniqueKey] : model.id}?`;
  }

  createDefault(proto?: object): E {
    return MetaModel.createEntity<E>(
      this.meta.metaUi,
      this.createEntity,
      proto,
    );
  }

  field(fldName: string) {
    const metaUi = this.meta?.metaUi;
    if (!metaUi) {
      throw new Error(
        `Logic "${this.repository}" has no metadata (field ${fldName})`,
      );
    }
    const field = metaUi.getField(fldName);
    if (!field) {
      throw new Error(
        `Logic "${this.repository}" missing field "${fldName}"`,
      );
    }
    return new MetaUiFieldLogic<E>(field);
  }

  group<G>(groupName: string) {
    const metaUi = this.meta?.metaUi;
    if (!metaUi) {
      throw new Error(
        `Logic "${this.repository}" has no metadata (group ${groupName})`,
      );
    }
    const group = metaUi.getGroup(groupName);
    if (!group) {
      throw new Error(
        `Logic "${this.repository}" missing group "${groupName}"`,
      );
    }
    return new MetaUiGroupLogic<E, G>(group);
  }

  /** vui 可覆盖以注入响应式包装。 */
  protected createSearchForm(): EntitySearchForm {
    return {
      searchParam: defaultSearchParam(),
      queryParams: {},
      searchFields: [],
      customSearchFields: [],
    };
  }

  beforeSearch(): EntitySearchForm {
    return (this.searchForm ??= this.createSearchForm());
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

  async applyTo(context: UiContext, view: UiViewType = "edit") {
    const logicView = await this.ensureViewLogic(view);
    const fn = this.getLogicFn(logicView);
    if (!fn) return;
    const { fields, groups, customActions } = fn.call(this);
    context.bindLogics?.(fields, groups, customActions);
  }

  getSimplifyOptions(): EntitySimplifyOptions {
    return defaultEntitySimplifyOptions;
  }

  error(e: any): never {
    console.error(e);
    throw e;
  }

  success(message: any) {
    console.info(message);
  }

  async getAll(
    param: EntitySearchParam = { pager: { pageSize: DEFAULT_PAGE_SIZE } },
  ): Promise<PagedList<E> | undefined> {
    try {
      const data = await this.apiClient.searchAll(param, {
        queryParams: { moduleCode: this.module?.moduleCode ?? "" },
        service: this.apiService,
      });
      data.list = defineEntityArray<E>(
        this.createEntity,
        data.list as object[],
      );
      return data as PagedList<E>;
    } catch (e) {
      this.error(e);
    }
  }

  /** Query another repository (does not use this.createEntity). */
  async getAllOf<T>(
    repository: string,
    param: EntitySearchParam = { pager: { pageSize: DEFAULT_PAGE_SIZE } },
    options?: { service?: string },
  ): Promise<PagedList<T> | undefined> {
    try {
      return (await this.apiClient.searchAll(param, {
        repository,
        service: options?.service ?? this.apiService,
      })) as PagedList<T>;
    } catch (e) {
      this.error(e);
    }
  }

  /** Load one row from another repository (does not use this.createEntity). */
  async loadOf<T>(
    repository: string,
    id: unknown,
    options?: { service?: string },
  ): Promise<T | undefined> {
    try {
      return (await this.apiClient.getOne(String(id), {
        repository,
        service: options?.service ?? this.apiService,
      })) as T;
    } catch (e) {
      this.error(e);
    }
  }

  /** Relative repository search. */
  async searchRelative<T>(
    param: EntitySearchParam,
    options: { repository: string; service?: string },
  ): Promise<PagedList<T> | undefined> {
    const queryParams = {
      ...(param.queryParams ?? {}),
      moduleCode: this.module?.moduleCode ?? "",
    };
    return this.getAllOf<T>(options.repository, { ...param, queryParams }, {
      service: options.service,
    });
  }

  async create(param: any = {}, entityUrlParam?: EntityUrlParam) {
    try {
      this.createParam = param;
      const data =
        isObject(param.entity) && !isNullObject(param.entity)
          ? param.entity
          : await this.apiClient.createOne(param, {
              service: this.apiService,
              ...entityUrlParam,
            });
      return this.createEntity(data);
    } catch (e) {
      this.error(e);
    }
  }

  importCreate(param: any = {}) {
    return this.create(param);
  }

  async crossSystemAccess(param: EntityUrlParam & { body?: any }) {
    try {
      const data = await this.apiClient.doAction(param, param.body);
      return this.createEntity(data);
    } catch (e) {
      this.error(e);
    }
  }

  async load(id: any) {
    try {
      const data = await this.apiClient.getOne(id, {
        service: this.apiService,
      });
      return this.createEntity(data);
    } catch (e) {
      this.error(e);
    }
  }

  async delete(id: any) {
    try {
      return await this.apiClient.deleteOne(id, { service: this.apiService });
    } catch (e) {
      this.error(e);
    }
  }

  async deleteAll(idList: string[]) {
    try {
      return await this.apiClient.deleteAll(idList, {
        service: this.apiService,
      });
    } catch (e) {
      this.error(e);
    }
  }

  async save(model: E) {
    try {
      const savable = MetaModel.savable(
        this.meta.metaUi,
        model,
        this.getSimplifyOptions(),
      );
      return await this.apiClient.saveOne(savable, {
        service: this.apiService,
      });
    } catch (e) {
      this.error(e);
    }
  }

  uploadFile(file: File, options: EntityUrlParam = {}) {
    return this.apiClient.uploadFile(
      file,
      {
        repository: options.repository ?? this.repository,
        service: options.service ?? this.apiService,
        ...options,
      },
      "file",
    );
  }

  uploadFiles(files: File[], options: EntityUrlParam = {}) {
    return this.apiClient.uploadFiles(
      files,
      {
        repository: options.repository ?? this.repository,
        service: options.service ?? this.apiService,
        ...options,
      },
      "files",
    );
  }

  importFile(file: File, options: EntityUrlParam = {}) {
    return this.apiClient.importExcel(file, "file", {
      repository: options.repository ?? this.repository,
      service: options.service ?? this.apiService,
      ...options,
    });
  }

  importFiles(files: File[], options: EntityUrlParam = {}) {
    return this.apiClient.importAll(files, "files", {
      repository: options.repository ?? this.repository,
      service: options.service ?? this.apiService,
      ...options,
    });
  }

  exportFile(id: string, options: EntityUrlParam = {}, body?: any) {
    return this.apiClient.exportOne(
      id,
      {
        repository: options.repository ?? this.repository,
        service: options.service ?? this.apiService,
        ...options,
      },
      body,
    );
  }

  exportFiles(options: EntityUrlParam = {}, body?: any) {
    return this.apiClient.exportAll(
      {
        repository: options.repository ?? this.repository,
        service: options.service ?? this.apiService,
        ...options,
      },
      body,
    );
  }

  async doAction(model: E, a: EntityAction) {
    try {
      const params =
        a.param?.type === "execute" ? a.param.value || {} : a.param;
      const result = await this.invokeAction(
        {
          path: model.id,
          action: a.name,
        },
        params,
      );
      if (result instanceof ApiProblem) {
        throw result;
      }
      if (result instanceof ApiError || isApiErrorPayload(result)) {
        throw toApiProblem(
          result instanceof ApiError ? result : toApiError(result),
        );
      }
      return result;
    } catch (e) {
      this.error(e);
    }
  }

  /** API service name (routes, etc.); prefer `this.apiClient`, not a different client from context. */
  get serviceName() {
    return (
      this.apiService ??
      this.apiClient?.config?.service ??
      "base"
    );
  }

  /**
   * Raw action (cross-repo / custom path). Prefer {@link doAction} for entity actions.
   * Use `this.apiClient` (same instance as `context.apiClient` when wired).
   */
  invokeAction(urlParam: EntityUrlParam, body?: unknown) {
    return this.apiClient.doAction(
      {
        repository: this.repository,
        service: this.serviceName,
        ...urlParam,
      },
      body,
    );
  }

  /** Header date filter: calendar days present in this repository. */
  getPivotDates(
    field: string,
    options: EntityUrlParam & { reload?: boolean } = {},
  ) {
    return this.apiClient.getPivotDates(field, {
      repository: this.repository,
      service: this.serviceName,
      ...options,
    });
  }

  /** Download-style action (returns Blob). */
  postBlob(urlParam: EntityUrlParam, body: unknown = {}) {
    return this.apiClient.http.postBlob(this.buildEntityURL(urlParam), body);
  }

  /** Build entity URL; Builders use this instead of touching apiClient. */
  buildEntityURL(urlParam: EntityUrlParam = {}) {
    return this.apiClient.buildEntityURL({
      repository: this.repository,
      service: this.serviceName,
      ...urlParam,
    });
  }

  async initMetadata(reload = false, params?: EntityUrlParam) {
    if (this.customPage) return;
    this.meta = await this.metaUiService.getPack(
      Object.assign(
        {},
        { repository: this.repository, service: this.apiService },
        params,
      ),
      reload,
    );
    if (
      this.meta?.metaUi?.objName &&
      this.module &&
      this.meta.metaUi.objName !== this.module.objName &&
      !params?.redirection
    ) {
      this.module = this.metaUiService.findModule(this.meta.metaUi.objName);
    }
    return this.meta;
  }

  loadMetadata(repository: string, service?: string, reload = false) {
    return this.metaUiService.getPack({ repository, service }, reload);
  }
}

export class SubEntityLogic<
  G extends Entity,
  P extends Entity,
> extends EntityLogic<G> {
  items: G[];
  metaUiGroup: MetaUiGroup;

  constructor(
    defineGroupItem: EntityCtor<G>,
    public readonly parent: EntityLogic<P>,
    public readonly master: P,
    public readonly groupName: string,
  ) {
    const { meta, metaUiService, module } = parent;
    const metaUiGroup = meta.metaUi.getGroup(groupName)!;
    super(defineGroupItem, {
      module,
      meta: { metaUi: metaUiGroup.groupUi! },
      metaUiService: metaUiService,
      repository: groupName,
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

export * from "./logic_functions";
export * from "./field_logic";
export * from "./group_logic";
