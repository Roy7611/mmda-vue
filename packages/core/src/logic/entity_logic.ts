import { ApiClient, type EntityUrlParam } from "../net/api_client";
import { ApiProblem, toApiProblem } from "../net/api_problem";
import { ApiError, isApiErrorPayload, toApiError } from "../net/api_error";
import { isObject, isNullObject } from "../utils/is";
import { Entity, type EntityCtor, type EntitySearchParam } from "../models/entity";
import {
  MetaModel,
  defaultEntitySimplifyOptions,
  defineEntityArray,
  type EntitySimplifyOptions,
} from "../models/metamodel";
import type { PagedList } from "../models/pagination";
import { DEFAULT_PAGE_SIZE } from "../models/pagination";
import type { EntityAction } from "../metaui/metaui_action";
import { MetaUiFieldLogic } from "./field_logic";
import { MetaUiGroupLogic } from "./group_logic";
import type { MetaUiPack, MetaUiService } from "../metaui/metaui_service";
import type { Module } from "../metaui/module";

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

/**
 * Entity Logic base: ApiClient + MetaModel CRUD, no Vue.
 * vui UiLogic extends this (router / view wiring).
 *
 * Data 通道：
 * - 实体 CRUD / 动作：用本类方法或 `this.apiClient`（不要在 Logic 再包一层 get/doAction）。
 * - `context.apiClient` 与 `this.apiClient` 同一实例，给会话/UI 助手（联想、选仓库等）；
 *   业务 Logic 不要绕过本类方法去直接打实体 CRUD。
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

  constructor(
    public readonly createEntity: EntityCtor<E>,
    init: EntityLogicInit,
  ) {
    this.metaUiService = init.metaUiService;
    this.repository = init.repository;
    this.meta = init.meta ?? ({ metaui: undefined } as any);
    this.module = init.module;
    this.isChild = init.isChild ?? false;
    this.customPage = init.customPage ?? false;
    this.apiService = init.apiService;
    this.apiClient = this.metaUiService.getApiClient(this.repository);
  }

  getModelTitle(model: E) {
    const metaui = this.meta.metaui;
    if (!metaui) return model.id;
    return `${metaui.displayLabel}?${metaui.uniqueKey ? model[metaui.uniqueKey] : model.id}?`;
  }

  createDefault(proto?: object): E {
    return MetaModel.createEntity<E>(
      this.meta.metaui,
      this.createEntity,
      proto,
    );
  }

  field(fldName: string) {
    const metaui = this.meta?.metaui;
    if (!metaui) {
      throw new Error(
        `Logic "${this.repository}" has no metadata (field ${fldName})`,
      );
    }
    const field = metaui.getField(fldName);
    if (!field) {
      throw new Error(
        `Logic "${this.repository}" missing field "${fldName}"`,
      );
    }
    return new MetaUiFieldLogic<E>(field);
  }

  group<G>(groupName: string) {
    const metaui = this.meta?.metaui;
    if (!metaui) {
      throw new Error(
        `Logic "${this.repository}" has no metadata (group ${groupName})`,
      );
    }
    const group = metaui.getGroup(groupName);
    if (!group) {
      throw new Error(
        `Logic "${this.repository}" missing group "${groupName}"`,
      );
    }
    return new MetaUiGroupLogic<E, G>(group);
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
        this.meta.metaui,
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

export * from "./logic_functions";
export * from "./field_logic";
export * from "./group_logic";
