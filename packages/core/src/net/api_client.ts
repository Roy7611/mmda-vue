import { MetaUi } from "./../metaui/metaui_group";
import { Entity } from "../models/entity";
import {
  toSearchRequest,
  type EntitySearchParam,
} from "../models/entity_search";
import {
  type Pagination,
  type PagedList,
  NO_PAGINATION,
  pagedList,
} from "../models/pagination";
/**
 * Http服务 / Web API 客户端
 * （1）要求使用Fetch API @see{@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API}
 * （2）不支持Fetch API的浏览器使用axios（目前不适用）
 * （3）HttpClient实现基础的get, post, put, delete函数，提供成功和失败回调函数传入
 *      // request(config)
        // get(url[, config])
        // delete(url[, config])
        // head(url[, config])
        // options(url[, config])
        // post(url[, data[, config]])
        // put(url[, data[, config]])
        // patch(url[, data[, config]])
 * （4）自动管理访问令牌
 * （5）基于实体框架实现实体数据访问快捷方式
 *      getOne( whID[,'Warehouse'])
 *      getAll(['Warehouse'])
 *      createOne('Warehouse'[, {}])
 *      save('Warehouse', w)
 *      saveAll('Warehouse', [])
 *      delete('Warehouse', whID)
 *      deleteAll('Warehouse', [])
 *
 */
import type { HttpClient } from "./http";
import { toApiError } from "./api_error";
import { ApiProblem } from "./api_problem";

/**
 * API 客户端配置
 *
 * {@link ApiClient}的构造选项
 */
export interface ApiClientConfig {
  service: string;
  repository?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number; // access token 过期时间戳（ms，Date.now() 口径）
  locale?: string;
  expiryInterval?: string;
}

/**
 * 实体仓储用来定义API URL
 * @example 例如
 * ```ts
 * const repo = {
 *    repository: "Warehouses",
 *    service: "wms"
 * }
 * ```
 **/
export interface EntityRepository {
  /** 仓储为实体名称复数，如`Warehouses` */
  repository?: string;
  /** 服务为云端微服务名称，如`wms` */
  service?: string;
}

/**
 * 实体URL参数
 *
 * 定义访问云端服务接口的传参规范，
 * 它是一个{@link EntityRepository | 实体仓储}，
 * 用来构建云端接口访问URL
 *
 * @see {@link ApiClient.buildEntityURL}
 */
export interface EntityUrlParam extends EntityRepository {
  /** 路径 */
  path?: string;
  /** 动作 */
  action?: string;
  /** 查询参数 */
  queryParams?: Record<string, any>;

  redirection?: string; // 重定向 设置后替代repository
}

/** 分页结果放HTTP Headers中的键值 */
export const PAGINATION_HEADER = "x-pager";

/**
 * API 客户端
 */
export class ApiClient {
  constructor(
    public readonly http: HttpClient,
    public readonly config: ApiClientConfig,
  ) {
    this.http.errorHandler = (err, req) => this.handleApiError(err, req);
  }
  repository(repository: string) {
    return new ApiClient(this.http, { ...this.config, repository });
  }
  joinURLs(...urls: string[]) {
    return urls.reduce((prev, curr) => this.http.joinURLs(prev, curr));
  }

  buildEntityURL({
    repository,
    path,
    action,
    queryParams,
    service,
  }: EntityUrlParam) {
    let url = `${service ?? this.config.service}/${
      repository ?? this.config.repository
    }`;
    if (path) {
      url += "/";
      url += path;
    }
    if (action) {
      url += "/";
      url += action;
    }
    if (queryParams) {
      const searchParams = new URLSearchParams(queryParams);
      // if(this.config.locale) searchParams.set('lang', this.config.locale);//服务器还不支持
      url += "?";
      url += searchParams.toString();
    }

    return url;
  }

  handleApiError(err: unknown, req: Request): never {
    if (err instanceof ApiProblem) throw err;
    throw toApiError(err, req);
  }

  getMetaUi(
    reload: boolean = false,
    { repository, service }: EntityRepository = {},
  ) {
    const url = this.buildEntityURL({
      repository,
      path: "metaui",
      queryParams: { reload },
      service,
    });
    return this.http.getJson(url).then((meta) => new MetaUi(meta));
  }

  getMetaUiPack(
    reload: boolean = false,
    { repository, service, queryParams }: EntityUrlParam = {},
  ) {
    const url = this.buildEntityURL({
      repository: repository,
      path: "metaUiPack",
      queryParams: Object.assign({}, { reload }, queryParams),
      service,
    });
    return this.http.getJson(url).then((meta) => {
      const { filters, metaUi, sorts } = meta;
      return {
        filters: filters,
        metaui: new MetaUi(metaUi),
        sorts: sorts,
      };
    });
  }
  //queryParams
  getOne(
    id: string,
    { repository, action, service, queryParams }: EntityUrlParam = {},
  ) {
    // if(!queryParams){
    //   queryParams.queryParams={};
    // }
    const url = this.buildEntityURL({
      repository,
      action,
      path: id,
      service,
      queryParams,
    });
    return this.http.getJson(url);
  }

  protected pagedDataExtractor(res: Response) {
    return res.json().then((data) => {
      let pagination: Pagination = res.headers.has(PAGINATION_HEADER)
        ? JSON.parse(res.headers.get(PAGINATION_HEADER))
        : NO_PAGINATION;
      return pagedList(data, pagination);
    });
  }
  getAll({
    repository,
    path,
    action,
    queryParams,
    service,
  }: EntityUrlParam = {}): Promise<PagedList<unknown>> {
    const url = this.buildEntityURL({
      repository,
      path,
      action,
      queryParams,
      service,
    });
    return this.http.get(url, {
      beforeSend: this.http.buildJsonHeaders(),
      resExtractor: this.pagedDataExtractor,
    });
  }

  searchAll(
    searchParam: any,
    { repository, queryParams, service }: EntityUrlParam = {},
  ): Promise<PagedList<unknown>> {
    const url = this.buildEntityURL({ repository, queryParams, service });
    return this.http.post(url, {
      options: {
        body: JSON.stringify(searchParam),
      },
      beforeSend: this.http.buildJsonHeaders(),
      resExtractor: this.pagedDataExtractor,
    });
  }

  /** 统一实体列表查询：简单条件走 GET，复杂 filterModel 走 body。 */
  searchEntities(
    param: EntitySearchParam,
    options: EntityUrlParam = {},
  ): Promise<PagedList<unknown>> {
    const request = toSearchRequest(param);
    const queryParams = {
      ...request.queryParams,
      ...(options.queryParams ?? {}),
    };
    return request.searchParams
      ? this.searchAll(request.searchParams, { ...options, queryParams })
      : this.getAll({ ...options, queryParams });
  }

  createOne(
    createParam: any,
    { repository, queryParams, service }: EntityUrlParam = { action: "create" },
  ) {
    const url = this.buildEntityURL({
      repository,
      action: "create",
      queryParams,
      service,
    });
    return this.http.postJson(url, createParam);
  }

  saveOne(data: Entity, { repository, service }: EntityUrlParam = {}) {
    const { ["rowNum"]: n, ["actions"]: a, ...savable } = data;
    const url = this.buildEntityURL({ repository, action: "save", service });
    return this.http.postJson(url, savable);
  }

  saveAll(data: any[], { repository, service }: EntityUrlParam = {}) {
    const url = this.buildEntityURL({ repository, action: "saveAll", service });
    return this.http.postJson(url, data);
  }

  exportOne(
    id: string,
    { repository, queryParams, service }: EntityUrlParam = { action: "export" },
    body?: any,
  ) {
    const url = this.buildEntityURL({
      repository,
      path: id,
      action: "export",
      queryParams,
      service,
    });
    return this.http.downloadFile(url, { options: { body } });
  }

  exportAll(
    { action, queryParams, path, repository, service }: EntityUrlParam = {
      action: "export",
    },
    body?: any,
  ) {
    const url = this.buildEntityURL({
      repository,
      path,
      action,
      queryParams,
      service,
    });
    return this.http.downloadFile(url, {
      options: { body },
      beforeSend: this.http.buildJsonHeaders(),
    });
  }

  importExcel(
    file: File,
    fieldName: string = "file",
    { repository, path: id, action, queryParams, service }: EntityUrlParam = {
      action: "import",
    },
    checkExists = false,
    ignoreError = false,
  ) {
    queryParams ??= new URLSearchParams();
    queryParams.append("checkExists", checkExists.toString());
    queryParams.append("ignoreError", ignoreError.toString());
    const url = this.buildEntityURL({
      repository,
      path: id,
      action,
      queryParams,
      service,
    });
    return this.http.uploadFile(url, fieldName, file);
  }

  importAll(
    files: File[],
    fieldName: string = "file",
    { repository, path: id, action, queryParams, service }: EntityUrlParam = {
      action: "importAll",
    },
  ) {
    queryParams ??= new URLSearchParams();
    const url = this.buildEntityURL({
      repository,
      path: id,
      action,
      queryParams,
      service,
    });
    return this.http.uploadFiles(url, fieldName, files);
  }

  deleteOne(
    id: string,
    { queryParams, repository, service }: EntityUrlParam = { action: "delete" },
  ) {
    const url = this.buildEntityURL({
      path: id,
      queryParams,
      repository,
      service,
    });
    return this.http.deleteJson(url, id);
  }
  deleteOneByPost(
    id: string,
    { queryParams, repository, service }: EntityUrlParam = { action: "delete" },
  ) {
    const url = this.buildEntityURL({
      action: "delete",
      queryParams,
      repository,
      service,
    });
    return this.http.postJson(url, id);
  }

  deleteAll(
    idList: string[],
    { queryParams, repository, service }: EntityUrlParam = {
      action: "deleteAll",
    },
  ) {
    const url = this.buildEntityURL({
      action: "deleteAll",
      queryParams,
      repository,
      service,
    });
    return this.http.postJson(url, idList);
  }

  doAction(
    { path: id, action, queryParams, repository, service }: EntityUrlParam = {},
    body?: any,
  ) {
    const url = this.buildEntityURL({
      path: id,
      action,
      queryParams,
      repository,
      service,
    });
    return this.http.postJson(url, body);
  }

  uploadFile(
    file: File,
    {
      path: id,
      action,
      queryParams,
      repository,
      service = "files",
    }: EntityUrlParam = {},
    fieldName: string,
  ) {
    // const url = this.buildEntityURL({path:id, action:'uploadFile', queryParams, repository, service});
    if (!action) action = service == "files" ? undefined : "importFile";
    const url = this.buildEntityURL({
      path: id,
      action,
      queryParams,
      repository,
      service,
    });
    return this.http.uploadFile(url, fieldName, file);
  }

  uploadFiles(
    files: File[],
    {
      path: id,
      action,
      queryParams,
      repository,
      service = "files",
    }: EntityUrlParam = {},
    fieldName: string,
  ) {
    if (!action) action = service == "files" ? undefined : "importManyFiles";
    const url = this.buildEntityURL({
      path: id,
      action,
      queryParams,
      repository,
      service,
    });
    return this.http.uploadFiles(url, fieldName, files);
  }
}
