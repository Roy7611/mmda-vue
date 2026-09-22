import { ApiClient, type EntityUrlParam } from "../net/api_client";
import { ApiProblem, isApiProblemPayload, toApiProblem } from "../net/api_problem";
import { isObject, isNullObject } from "../utils/is";
import { Entity, type EntityCtor, EntitySearchParam, type SelectableFn } from "../models/entity";
import {
  MetaModel,
  defaultEntitySimplifyOptions,
  defineEntityArray,
  type EntitySimplifyOptions,
} from "../models/metamodel";
import type { PagedList } from "../models/pagination";
import { DEFAULT_PAGE_SIZE, NO_PAGINATION } from "../models/pagination";
import type { EntityAction } from "../models/entity_action";
import type { MetaUi, MetaUiGroup } from "../metaui/metaui_group";
import { MetaUiFieldLogic } from "./field_logic";
import { MetaUiGroupLogic } from "./group_logic";
import type {
  TableColumnSettings,
  MetaUiService,
} from "../metaui/metaui_service";
import type { Module } from "../metaui/module";
import type { EntityQuery } from "../models/entity_search";
import type { UiContext } from "../ui/context";
import type { Validation } from "./validation";
import type { Predicate } from "./logic_functions";
import type { UniListViewProps, UiViewType } from "../ui/view";
import { UiViewMany, UiViewOne } from "../ui/view";
import { firstLetterUpper } from "../utils/string";
import { type DependencyContainer, type InjectionTokenLike } from "../di/dependency";

export interface ListSettingsPayload {
  service: string;
  repository: string;
  fields: TableColumnSettings[];
}

function lastQueryCacheKey(repository: string) {
  return `${repository}/lastQuery`;
}

export interface EntityLogicInit {
  metaUiService: MetaUiService;
  repository: string;
  metaUi?: MetaUi;
  module?: Module;
  isChild?: boolean;
  customPage?: boolean;
  /** Backend feature module name, e.g. `mes` | `base`; used by routes and API. */
  apiService?: string;
}

/** 自定义搜索字段的 Logic 层最小视图：业务装配时只需给出渲染与取值契约。 */
export interface EntityCustomSearchField {
  searchLabel?: string;
  searchParam: string;
  renderer?: (...args: any[]) => unknown;
  defaultValue?: unknown;
  valueFn?: (value: unknown) => unknown;
  hasVal?: boolean;
  searchValue?: unknown;
}

/** 各视图类型的额外配置：键为视图类型，值为返回该视图渲染选项的函数。 */
export type UiViewOptions = Partial<
  Record<UiViewType, (ctx: UiContext) => Record<string, unknown>>
>;

/** 由视图类型推导 `beforeXxx` 钩子名，例如 `edit` -> `beforeEdit`。 */
export const beforeView = (viewType: string) =>
  `before${firstLetterUpper(viewType)}`;

/** `beforeXxx` 钩子的返回值：字段逻辑、分组逻辑和自定义动作的集合。 */
export type UiLogicFnResult<E extends Entity = Entity> = {
  /** 字段逻辑：可见、只读、校验、onChange，自定义渲染器和编辑器等 */
  fields: MetaUiFieldLogic<E>[];
  /** 子表逻辑：整组可见、只读、onChangeGroup，添加、删除操作以及自定义渲染器和编辑器，细到子表字段级逻辑 */
  groups: MetaUiGroupLogic<E, Entity>[];
  /** 页面级自定义操作：例如详情页面上工具栏临时加个按钮 */
  customActions: EntityAction[];
  /** 仅搜索视图使用：业务声明的自定义搜索字段（渲染与取值契约）。 */
  customSearchFields?: EntityCustomSearchField[];
};

/** 视图逻辑钩子：在视图初始化前装配该视图的字段/分组/动作。 */
export type UiLogicFn<E extends Entity = Entity> = () => UiLogicFnResult<E>;

/** 视图逻辑函数集合：可以是一个钩子函数，也可以是多个钩子组成的对象。 */
export type UiLogicFnResultSet<E extends Entity = Entity> =
  | UiLogicFn<E>
  | Record<string, UiLogicFn<E> | unknown>;

/** 视图逻辑函数异步加载器：返回 Promise，适合按需分包加载。 */
export type UiLogicFnAsyncLoader<E extends Entity = Entity> = () => Promise<UiLogicFnResultSet<E>>;

/** 单个实体动作执行前的钩子：返回 `false` 可取消动作。 */
export type UiLogicBeforeFn<E> = (
  context: UiContext,
  model?: E,
  ...args: unknown[]
) => Promise<boolean>;

/** 单个实体动作执行后的钩子：`apiResultOrError` 是接口结果或异常。 */
export type UiLogicAfterFn<E> = (
  context: UiContext,
  model: E,
  action?: EntityAction,
  apiResultOrError?: unknown,
) => unknown;

/** 批量实体动作执行前的钩子：返回 `false` 可取消动作。 */
export type UiManyLogicBeforeFn<E> = (
  context: UiContext,
  models: E[],
  ...args: unknown[]
) => Promise<boolean>;

/** 批量实体动作执行后的钩子。 */
export type UiManyLogicAfterFn<E> = (
  context: UiContext,
  models: E[],
  ...args: unknown[]
) => void;

/**
 * Entity Logic：ApiClient + MetaModel CRUD + 视图钩子装配。无 Vue。
 *
 * Data 通道：
 * - 实体 CRUD / 动作：用本类方法或 `this.apiClient`。
 * - `context.apiClient` 与 `this.apiClient` 同一实例。
 * - 面向用户文案用 `context.t()`（vui 由 VuiContext 实现）。
 */
export abstract class EntityLogic<E extends Entity> {
  metaUi?: MetaUi;
  viewUi?: MetaUi;
  module?: Module;
  createParam: unknown;
  readonly metaUiService: MetaUiService;
  readonly apiClient: ApiClient;
  readonly repository: string;
  readonly isChild: boolean;
  readonly customPage: boolean;
  readonly apiService?: string;

  indexViewProps?: UniListViewProps;
  viewLogicLoaders: Partial<Record<UiViewType, UiLogicFnAsyncLoader<E>>> = {};
  viewOptions?: UiViewOptions;

  readonly #relativeLogics: Record<
    string,
    (master: E) => SubEntityLogic<Entity, E>
  >;
  #searchFields?: MetaUiFieldLogic<E>[];
  #searchGroups?: MetaUiGroupLogic<E, Entity>[];
  #searchActions?: EntityAction[];
  #searchCustomFields?: EntityCustomSearchField[];
  #editFields?: MetaUiFieldLogic<E>[];
  #editGroups?: MetaUiGroupLogic<E, Entity>[];
  #editActions?: EntityAction[];
  #detailsFields?: MetaUiFieldLogic<E>[];
  #detailsGroups?: MetaUiGroupLogic<E, Entity>[];
  #detailsActions?: EntityAction[];
  #indexFields?: MetaUiFieldLogic<E>[];
  #indexGroups?: MetaUiGroupLogic<E, Entity>[];
  #indexActions?: EntityAction[];
  #selectManyFields?: MetaUiFieldLogic<E>[];
  #selectManyGroups?: MetaUiGroupLogic<E, Entity>[];
  #selectManyActions?: EntityAction[];
  readonly #loadingViewLogics = new Map<UiViewType, Promise<void>>();

  /** 加载当前实体数据前；返回 `false` 可取消加载。 */
  beforeLoad?: UiLogicBeforeFn<E>;
  /** 当前实体数据加载完成后。 */
  afterLoad?: UiLogicAfterFn<E>;
  /** 校验前；返回 `false` 可取消校验。 */
  beforeValidate?: UiLogicBeforeFn<E>;
  /** 校验完成后；返回本次校验的错误数量。 */
  afterValidate?: (
    context: UiContext,
    model: E,
    validation: Validation,
  ) => Promise<number>;
  /** 保存前；返回 `false` 可取消保存。 */
  beforeSave?: UiLogicBeforeFn<E>;
  /** 保存完成后。 */
  afterSave?: UiLogicAfterFn<E>;
  /** 导入前；返回 `false` 可取消导入。 */
  beforeImport?: UiLogicBeforeFn<E>;
  /** 导入完成后。 */
  afterImport?: UiLogicAfterFn<E>;
  /** 打印前；返回 `false` 可取消打印。 */
  beforePrint?: UiLogicBeforeFn<E>;
  /** 打印完成后。 */
  afterPrint?: UiLogicAfterFn<E>;
  /** 上传前；返回 `false` 可取消上传。 */
  beforeUpload?: UiLogicBeforeFn<E>;
  /** 上传完成后。 */
  afterUpload?: UiLogicAfterFn<E>;
  /** 通用实体动作执行前；返回 `false` 可取消动作。 */
  beforeAction?: UiLogicBeforeFn<E>;
  /** 通用实体动作执行完成后。 */
  afterAction?: UiLogicAfterFn<E>;
  /** 删除前；返回 `false` 可取消删除。 */
  beforeDelete?: UiLogicBeforeFn<E>;
  /** 删除完成后。 */
  afterDelete?: UiLogicAfterFn<E>;
  /** 批量删除前；返回 `false` 可取消批量删除。 */
  beforeDeleteAll?: UiManyLogicBeforeFn<E>;
  /** 批量删除完成后。 */
  afterDeleteAll?: UiManyLogicAfterFn<E>;
  /** 重置筛选前；返回 `false` 可取消重置。 */
  beforeResetFilters?: UiManyLogicBeforeFn<E>;
  /** 重置筛选完成后。 */
  afterResetFilters?: UiManyLogicAfterFn<E>;
  /** 分组动作可见性：按组名和动作名返回谓词。 */
  groupActionVisibles?: Record<string, Record<string, Predicate<E>>>;
  /** 按名称注册的可选项生成函数。 */
  selectableList?: Record<string, SelectableFn<E>>;

  constructor(
    public readonly createEntity: EntityCtor<E>,
    init: EntityLogicInit,
  ) {
    this.metaUiService = init.metaUiService;
    this.repository = init.repository;
    this.metaUi = init.metaUi;
    this.module = init.module;
    this.isChild = init.isChild ?? false;
    this.customPage = init.customPage ?? false;
    this.apiService = init.apiService;
    this.apiClient = this.metaUiService.getApiClient(this.repository);
    this.#relativeLogics = {};
  }

  addRelativeLogic<R extends Entity>(
    name: string,
    logicCreator: (master: E) => SubEntityLogic<R, E>,
  ) {
    this.#relativeLogics[name] = logicCreator as unknown as (master: E) => SubEntityLogic<Entity, E>;
  }

  createRelativeLogic<R extends Entity>(name: string, master: E) {
    const logicCreator = this.#relativeLogics[name];
    return logicCreator
      ? (logicCreator(master) as unknown as SubEntityLogic<R, E>)
      : null;
  }

  getLogicFn(view: UiViewType): UiLogicFn<E> {
    const self = this as unknown as Record<string, UiLogicFn<E> | undefined>
    const key = beforeView(view)
    return self[key] as UiLogicFn<E>
  }

  #resolveLogicView(view: UiViewType): UiViewType {
    if (view === "create" || view === "editMany") return UiViewOne.Edit;
    if (view === "selectOne") return UiViewMany.Index;
    if (
      view === "selectMany" &&
      !this.viewLogicLoaders.selectMany &&
      this.beforeSelectMany === EntityLogic.prototype.beforeSelectMany
    ) {
      return UiViewMany.Index;
    }
    return view;
  }

  async ensureViewLogic(view: UiViewType): Promise<UiViewType> {
    const logicView = this.#resolveLogicView(view);
    const loader = this.viewLogicLoaders[logicView];
    if (!loader) return logicView;

    let loading = this.#loadingViewLogics.get(logicView);
    if (!loading) {
      loading = loader().then((loaded) => {
        const methodName = beforeView(logicView);
        if (typeof loaded === "function") {
          const self = this as unknown as Record<string, UiLogicFn<E>>
          self[methodName] = loaded;
          return;
        }
        const method = loaded[methodName];
        if (typeof method === "function") {
          const self = this as unknown as Record<string, UiLogicFn<E>>
          self[methodName] = method as UiLogicFn<E>;
        }
      });
      this.#loadingViewLogics.set(logicView, loading);
    }
    await loading;
    return logicView;
  }

  getModelTitle(model: E) {
    const metaUi = this.metaUi;
    if (!metaUi) return model.id;
    return `${metaUi.displayLabel}?${metaUi.uniqueKey ? model[metaUi.uniqueKey] : model.id}?`;
  }

  createDefault(proto?: object): E {
    return MetaModel.createEntity<E>(
      this.metaUi!,
      this.createEntity,
      proto,
    );
  }

  field(fldName: string) {
    const metaUi = this.metaUi;
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

  group<G extends Entity>(groupName: string) {
    const metaUi = this.metaUi;
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

  beforeSearch(): UiLogicFnResult<E> {
    this.#searchFields ??= [];
    this.#searchGroups ??= [];
    this.#searchActions ??= [];
    this.#searchCustomFields ??= [];
    return {
      fields: this.#searchFields,
      groups: this.#searchGroups,
      customActions: this.#searchActions,
      customSearchFields: this.#searchCustomFields,
    };
  }

  beforeEdit(): UiLogicFnResult<E> {
    this.#editFields ??= [];
    this.#editGroups ??= [];
    this.#editActions ??= [];
    return {
      fields: this.#editFields,
      groups: this.#editGroups,
      customActions: this.#editActions,
    };
  }

  beforeDetails(): UiLogicFnResult<E> {
    this.#detailsFields ??= [];
    this.#detailsGroups ??= [];
    this.#detailsActions ??= [];
    return {
      fields: this.#detailsFields,
      groups: this.#detailsGroups,
      customActions: this.#detailsActions,
    };
  }

  beforeIndex(): UiLogicFnResult<E> {
    this.#indexFields ??= [];
    this.#indexGroups ??= [];
    this.#indexActions ??= [];
    return {
      fields: this.#indexFields,
      groups: this.#indexGroups,
      customActions: this.#indexActions,
    };
  }

  beforeSelectMany(): UiLogicFnResult<E> {
    this.#selectManyFields ??= [];
    this.#selectManyGroups ??= [];
    this.#selectManyActions ??= [];
    return {
      fields: this.#selectManyFields,
      groups: this.#selectManyGroups,
      customActions: this.#selectManyActions,
    };
  }

  async applyTo(
    context: UiContext<E>,
    view: UiViewType = UiViewOne.Edit,
  ): Promise<UiLogicFnResult<E> | undefined> {
    const logicView = await this.ensureViewLogic(view);
    const fn = this.getLogicFn(logicView);
    if (!fn) return undefined;
    const result = fn.call(this);
    context.bindLogics?.(result.fields, result.groups, result.customActions);
    return result;
  }

  getSimplifyOptions(): EntitySimplifyOptions {
    return defaultEntitySimplifyOptions;
  }

  error(e: unknown): never {
    console.error(e);
    throw e;
  }

  success(message: unknown) {
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

  async getJoinList(
    param: EntitySearchParam = { pager: { pageSize: DEFAULT_PAGE_SIZE } },
  ): Promise<PagedList<E> | undefined> {
    try {
      const data = await this.apiClient.searchJoinList(param, {
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

  async create(param: unknown = {}, entityUrlParam?: EntityUrlParam) {
    try {
      this.createParam = param;
      const paramRecord = param as { entity?: unknown };
      const data =
        isObject(paramRecord.entity) && !isNullObject(paramRecord.entity)
          ? paramRecord.entity
          : await this.apiClient.createOne(param, {
              service: this.apiService,
              ...entityUrlParam,
            });
      return this.createEntity(data);
    } catch (e) {
      this.error(e);
    }
  }

  importCreate(param: unknown = {}) {
    return this.create(param);
  }

  async crossSystemAccess(param: EntityUrlParam & { body?: unknown }) {
    try {
      const data = await this.apiClient.doAction(param, param.body);
      return this.createEntity(data);
    } catch (e) {
      this.error(e);
    }
  }

  async load(id: unknown) {
    try {
      const data = await this.apiClient.getOne(String(id), {
        service: this.apiService,
      });
      return this.createEntity(data);
    } catch (e) {
      this.error(e);
    }
  }

  async delete(id: unknown) {
    try {
      return await this.apiClient.deleteOne(String(id), { service: this.apiService });
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
        this.metaUi!,
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

  exportFile(id: string, options: EntityUrlParam = {}, body?: unknown) {
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

  exportFiles(options: EntityUrlParam = {}, body?: unknown) {
    return this.apiClient.exportAll(
      {
        repository: options.repository ?? this.repository,
        service: options.service ?? this.apiService,
        ...options,
      },
      body,
    );
  }

  exportJoinList(options: EntityUrlParam = {}, body?: unknown) {
    return this.apiClient.exportJoinList(
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
      const actionParam = a.param as { type?: unknown; value?: unknown } | undefined;
      const params =
        actionParam?.type === "execute"
          ? (actionParam.value as object | undefined) ?? {}
          : a.param;
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
      if (result instanceof ApiProblem || isApiProblemPayload(result)) {
        throw toApiProblem(result);
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
    const repository =
      params?.redirection ?? params?.repository ?? this.repository;
    const service = params?.service ?? this.apiService;
    this.metaUi = await this.metaUiService.get(repository, service, reload);
    if (
      this.metaUi?.objName &&
      this.module &&
      this.metaUi.objName !== this.module.objName &&
      !params?.redirection
    ) {
      this.module = this.metaUiService.findModule(this.metaUi.objName);
    }
    return this.metaUi;
  }

  loadMetadata(repository: string, service?: string, reload = false) {
    return this.metaUiService.get(repository, service, reload);
  }

  async getReportTemplates(repository?: string) {
    try {
      const res = await this.apiClient.getAll({
        repository: repository ?? this.repository,
        action: "getAllTemplate",
      });
      return res?.list ?? null;
    } catch {
      return null;
    }
  }

  saveListSettings(payload: ListSettingsPayload) {
    return this.apiClient.http.postJson("meta/listSettings/save", payload);
  }

  getLastQuery() {
    return this.metaUiService.localDb?.get(
      lastQueryCacheKey(this.repository),
    ) as Promise<EntityQuery | undefined>;
  }

  putLastQuery(query: EntityQuery) {
    return this.metaUiService.localDb?.put(
      lastQueryCacheKey(this.repository),
      query,
    );
  }

  deleteLastQuery() {
    return this.metaUiService.localDb?.delete(
      lastQueryCacheKey(this.repository),
    );
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
    const { metaUi, metaUiService, module } = parent;
    const metaUiGroup = metaUi?.getGroup(groupName);
    if (!metaUiGroup?.groupUi) {
      throw new Error(
        `SubEntityLogic "${groupName}": parent MetaUi has no groupUi` +
          ` (parent.objName=${metaUi?.objName ?? "?"},` +
          ` groups=[${(metaUi?.groups ?? [])
            .map((g: { groupName: string }) => g.groupName)
            .join(",")}])`,
      );
    }
    super(defineGroupItem, {
      module,
      metaUi: metaUiGroup.groupUi,
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

  create(param?: unknown) {
    this.createParam = param;
    return Promise.resolve(
      MetaModel.createEntity(this.metaUi!, this.createEntity, param),
    );
  }

  load(id: unknown) {
    const e = this.items.find((it: G) => it.id == id);
    return e ? Promise.resolve(e) : Promise.reject(Error(`${id} not found`));
  }

  delete(id: unknown) {
    const idx = this.items.findIndex((it: G) => it.id == id);
    if (idx >= 0)
      return Promise.resolve(MetaModel.deleteItemByIndex(this.items, idx));
    return Promise.reject(Error(`${id} not found`));
  }

  save(child: G) {
    const idx = this.items.findIndex((it: G) => it.id == child.id);
    if (idx >= 0) Object.assign(this.items[idx], child);
    else {
      Object.entries(this.metaUiGroup.joinFields ?? {}).forEach(([k, v]) => {
        (child as Record<string, unknown>)[k] = this.master[v];
      });
      this.items.push(child);
    }
    return Promise.resolve(1);
  }

  async initMetadata(reload = false, params?: EntityUrlParam) {
    if (params?.redirection) {
      const repository =
        params.redirection ?? params.repository ?? this.repository;
      const service = params.service ?? this.apiService;
      this.metaUi = await this.metaUiService.get(repository, service, reload);
    } else {
      this.metaUiGroup = this.parent.metaUi!.getGroup(this.groupName)!;
      this.metaUi = this.metaUiGroup.groupUi!;
    }
    return this.metaUi;
  }
}

/**
 * 通用实体 Logic：未注册业务 Logic 时的默认实现（无框架依赖）。
 * 跨框架复用，统一通过 `GenericEntityLogic.resolve(di, token, ...)` 从 DI 获取；
 * 调用方不要 `new`，也不要再写 Vue/React 专用壳。
 */
export class GenericEntityLogic<E extends Entity = Entity> extends EntityLogic<E> {
  /**
   * 从 DI 解析实体 Logic：已注册自定义 Logic 时直接返回；
   * 未注册时按 token 注册默认通用实现（singleton）后返回。
   * 这是获取通用实体 Logic 的唯一入口，调用方不要 `new GenericEntityLogic(...)`。
   */
  static async resolve<E extends Entity>(
    di: DependencyContainer,
    token: InjectionTokenLike<EntityLogic<E>>,
    createEntity: EntityCtor<E>,
    init: EntityLogicInit,
  ): Promise<EntityLogic<E>> {
    try {
      return await di.injectAsync(token);
    } catch {
      di.provide(token, () => new GenericEntityLogic(createEntity, init));
      return await di.injectAsync(token);
    }
  }
}

export * from "./logic_functions";
export * from "./field_logic";
export * from "./group_logic";
