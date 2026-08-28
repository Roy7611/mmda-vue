import type { Router } from "vue-router";
import type { I18n } from "vue-i18n";
import type { WatchCallback, WatchOptions } from "vue";
import {
  ApiClient,
  ApiError,
  isApiErrorPayload,
  toApiError,
  isObject,
  isNullObject,
  MetaModel,
  NO_PAGINATION,
  DEFAULT_PAGE_SIZE,
  defaultEntitySimplifyOptions,
  defaultSearchParam,
  defineEntityArray,
  MetaUiFieldLogic,
  MetaUiGroupLogic,
  type Entity,
  type EntityAction,
  type EntityCtor,
  type EntitySearchParam,
  type EntitySimplifyOptions,
  type EntityUrlParam,
  type MetaUiGroup,
  type MetaUiPack,
  type MetaUiService,
  type Module,
  type PagedList,
  type Predicate,
  type SelectableFn,
  type UiContext,
  type UiValidation,
} from "@mmda/core";
import { rx } from "../rx";
import { UiCustomSearchField, UiSearchField } from "./ui_filter";
import type { UniListViewProps } from "./ui_state";
import type { UiViewType } from "./ui_view";
import type { UiViewContext } from "./ui_context";

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

export interface UiLogicInit {
  service: MetaUiService;
  repository: string;
  router?: Router | any;
  meta?: MetaUiPack;
  module?: Module;
  isChild?: boolean;
  i18n?: I18n;
  customPage?: boolean;
  transService?: string;
}

export abstract class UiLogic<E extends Entity> {
  meta: MetaUiPack;
  module?: Module;
  listViewProps?: UniListViewProps;
  createParam: any;
  readonly metaUiService: MetaUiService;
  readonly apiClient: ApiClient;
  readonly repository: string;
  readonly router?: Router | any;
  readonly isChild: boolean;
  readonly customPage: boolean;
  readonly transService?: string;
  viewLogicLoaders: Partial<Record<UiViewType, UiViewLogicLoader<E>>> = {};

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
  private readonly loadingViewLogics = new Map<
    UiViewType,
    Promise<void>
  >();

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
        field.hasVal ? field.currentOp.toSQL(field.searchValue) : "",
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

  constructor(
    public readonly createEntity: EntityCtor<E>,
    init: UiLogicInit,
  ) {
    this.metaUiService = init.service;
    this.repository = init.repository;
    this.router = init.router;
    this.meta = init.meta ?? ({ metaui: undefined } as any);
    this.module = init.module;
    this.isChild = init.isChild ?? false;
    this.customPage = init.customPage ?? false;
    this.transService = init.transService;
    this.apiClient = this.metaUiService.getApiClient(this.repository);
    this.relativeLogics = {};
  }

  getModelTitle(model: E) {
    const metaui = this.meta.metaui;
    if (!metaui) return model.id;
    return `${metaui.displayLabel}【${metaui.uniqueKey ? model[metaui.uniqueKey] : model.id}】`;
  }

  createDefault(proto?: object): E {
    return MetaModel.createEntity<E>(
      this.meta.metaui,
      this.createEntity,
      proto,
    );
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
    const metaui = this.meta?.metaui;
    if (!metaui) {
      throw new Error(
        `UiLogic[${this.repository}] 尚未加载元数据，无法配置字段 ${fldName}`,
      );
    }
    const field = metaui.getField(fldName);
    if (!field) {
      throw new Error(
        `UiLogic[${this.repository}] 元数据中不存在字段 ${fldName}`,
      );
    }
    return new MetaUiFieldLogic<E>(field);
  }

  group<G>(groupName: string) {
    const metaui = this.meta?.metaui;
    if (!metaui) {
      throw new Error(
        `UiLogic[${this.repository}] 尚未加载元数据，无法配置分组 ${groupName}`,
      );
    }
    const group = metaui.getGroup(groupName);
    if (!group) {
      throw new Error(
        `UiLogic[${this.repository}] 元数据中不存在分组 ${groupName}`,
      );
    }
    return new MetaUiGroupLogic<E, G>(group);
  }

  getSimplifyOptions(): EntitySimplifyOptions {
    return defaultEntitySimplifyOptions;
  }

  beforeSearch(): UiSearchForm {
    return (this.searchForm ??= {
      searchParam: rx(defaultSearchParam()),
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

  async applyTo(context: UiViewContext, view: UiViewType = "edit") {
    const logicView = await this.ensureViewLogic(view);
    const fn = this.getLogicFn(logicView);
    if (!fn) return;
    const { fields, groups, customActions } = fn.call(this);
    context.bindLogics(fields, groups, customActions);
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
      const data = await this.apiClient.searchEntities(param, {
        queryParams: { moduleCode: this.module?.moduleCode ?? "" },
        service: this.transService,
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

  async create(param: any = {}, entityUrlParam?: EntityUrlParam) {
    try {
      this.createParam = param;
      const data =
        isObject(param.entity) && !isNullObject(param.entity)
          ? param.entity
          : await this.apiClient.createOne(param, entityUrlParam);
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
        service: this.transService,
      });
      return this.createEntity(data);
    } catch (e) {
      this.error(e);
    }
  }

  async delete(id: any) {
    try {
      return await this.apiClient.deleteOne(id, { service: this.transService });
    } catch (e) {
      this.error(e);
    }
  }

  async deleteAll(idList: string[]) {
    try {
      return await this.apiClient.deleteAll(idList);
    } catch (e) {
      this.error(e);
    }
  }

  async save(model: E) {
    try {
      const savable = MetaModel.savable(
        this.meta.metaui,
        model,
        this.getSimplifyOptions(),
      );
      return await this.apiClient.saveOne(savable, {
        service: this.transService,
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
        service: options.service ?? this.transService,
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
        service: options.service ?? this.transService,
        ...options,
      },
      "files",
    );
  }

  importFile(file: File, options: EntityUrlParam = {}) {
    return this.apiClient.importExcel(file, "file", {
      repository: options.repository ?? this.repository,
      service: options.service ?? this.transService,
      ...options,
    });
  }

  importFiles(files: File[], options: EntityUrlParam = {}) {
    return this.apiClient.importAll(files, "files", {
      repository: options.repository ?? this.repository,
      service: options.service ?? this.transService,
      ...options,
    });
  }

  exportFile(id: string, options: EntityUrlParam = {}, body?: any) {
    return this.apiClient.exportOne(
      id,
      {
        repository: options.repository ?? this.repository,
        service: options.service ?? this.transService,
        ...options,
      },
      body,
    );
  }

  exportFiles(options: EntityUrlParam = {}, body?: any) {
    return this.apiClient.exportAll(
      {
        repository: options.repository ?? this.repository,
        service: options.service ?? this.transService,
        ...options,
      },
      body,
    );
  }

  async doAction(model: E, a: EntityAction) {
    try {
      const params =
        a.param?.type === "execute" ? a.param.value || {} : a.param;
      const result = await this.apiClient.doAction(
        {
          path: model.id,
          action: a.name,
          service: this.transService ?? this.apiClient.config.service,
        },
        params,
      );
      if (result instanceof ApiError || isApiErrorPayload(result)) {
        throw result instanceof ApiError ? result : toApiError(result);
      }
      return result;
    } catch (e) {
      this.error(e);
    }
  }

  async initMetadata(reload = false, params?: EntityUrlParam) {
    if (this.customPage) return;
    this.meta = await this.metaUiService.getPack(
      Object.assign({}, { repository: this.repository }, params),
      reload,
    );
    if (
      this.meta?.metaui?.objName &&
      this.module &&
      this.meta.metaui.objName !== this.module.objName &&
      !params?.redirection
    ) {
      this.module = this.metaUiService.findModule(this.meta.metaui.objName);
    }
    return this.meta;
  }

  loadMetadata(repository: string, service?: string, reload = false) {
    return this.metaUiService.getPack({ repository, service }, reload);
  }
}

/** 无定制字段逻辑时的仓库 Logic，供通用 CRUD 页与跨服务 select 使用 */
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
    const metaUiGroup = meta.metaui.getGroup(groupName)!;
    super(defineGroupItem, {
      module,
      meta: { metaui: metaUiGroup.groupUi! },
      service: metaUiService,
      repository: groupName,
      router,
      isChild: true,
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
      MetaModel.createEntity(this.meta.metaui, this.createEntity, param),
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
        Object.assign({}, { repository: this.repository }, params),
        reload,
      );
    } else {
      this.metaUiGroup = this.parent.meta.metaui.getGroup(this.groupName)!;
      this.meta = { metaui: this.metaUiGroup.groupUi! };
    }
    return this.meta;
  }
}
