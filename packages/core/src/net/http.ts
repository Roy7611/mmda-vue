import { DateTime } from "luxon";
import { isApiErrorPayload, toApiError } from "./api_error";

export interface RequestContext {
  /**
   * 当前请求资源url
   */
  url: string | URL;

  /**
   * 当前请求选项，包括Headers和Body
   */
  options: RequestInit;

  /**
   * 是否已经放弃当前请求
   */
  cancelled: boolean;
  /**
   * 超时设置ms
   */
  timeout?: number;
  /**
   * 进度
   */
  progress: number;
  /**
   * 为 true 时遇到 401 不再尝试 refresh（刷新令牌请求自身应设置）
   */
  skipAuthRefresh?: boolean;
}
type DataType = "text" | "json" | "blob" | "arrayBuffer" | "formData";
export type BeforeRequest = (r: RequestContext) => void;
export type AfterResponse = (r: Response) => Promise<any>;
export type HttpErrorHandler = (error: any, req: Request) => void;
export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
}
export enum ContentType {
  json = "application/json",
  text = "text/plain",
  formData = "multipart/form-data",
}
/**
 * Http请求参数
 */
export interface HttpRequestParam {
  /**
   * 请求选项，包括Headers和Body
   */
  options?: RequestInit;
  /**
   * 发送请求前的拦截器
   */
  beforeSend?: BeforeRequest;
  /**
   * 响应结果解包
   */
  resExtractor?: AfterResponse;
}
/**
 * Http客户端
 * @abstract
 */
export abstract class HttpClient {
  readonly signal: AbortSignal;
  errorHandler?: HttpErrorHandler;
  unauthorizedErrorHandler?: HttpErrorHandler;
  /** 401 时调用；多个并发 401 共用同一次 refresh */
  refreshHandler?: () => Promise<boolean>;
  protected afterResponse?: AfterResponse;
  private readonly beforeRequestInterceptors: BeforeRequest[] = [];
  private refreshInFlight?: Promise<boolean>;

  constructor(
    public baseUrl?: string,
    initialBeforeRequest?: BeforeRequest,
    public includeCredentials = true,
    unauthorizedErrorHandler?: HttpErrorHandler,
  ) {
    this.unauthorizedErrorHandler = unauthorizedErrorHandler;
    if (initialBeforeRequest) this.useBeforeRequest(initialBeforeRequest);
  }

  /** 追加请求前拦截器（认证、locale 等各挂各的，互不覆盖） */
  useBeforeRequest(fn: BeforeRequest): this {
    this.beforeRequestInterceptors.push(fn);
    return this;
  }

  /**
   * @deprecated 赋值只会追加拦截器，不会清空已有项。请用 {@link useBeforeRequest}
   */
  set beforeRequest(fn: BeforeRequest | undefined) {
    if (fn) this.useBeforeRequest(fn);
  }

  get beforeRequest(): BeforeRequest | undefined {
    if (this.beforeRequestInterceptors.length === 0) return undefined;
    return (ctx) => this.runBeforeRequestInterceptors(ctx);
  }

  protected runBeforeRequestInterceptors(ctx: RequestContext) {
    for (const fn of this.beforeRequestInterceptors) fn(ctx);
  }

  protected isUnauthorized(error: unknown): boolean {
    const status = toApiError(error).status;
    return status === 401;
  }

  protected tryRefresh(ctx: RequestContext): Promise<boolean> {
    if (ctx.skipAuthRefresh || !this.refreshHandler) return Promise.resolve(false);
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.refreshHandler().finally(() => {
        this.refreshInFlight = undefined;
      });
    }
    return this.refreshInFlight;
  }

  protected abstract request(
    input: RequestInfo | URL,
    ctx?: RequestInit,
  ): Promise<Response>;

  protected buildOptions(method: HttpMethod, options?: RequestInit) {
    options ??= {};
    if (this.includeCredentials) options.credentials = "include";
    else options.credentials = "same-origin";
    options.method = method;
    return options;
  }

  mergeHeaders(
    headers: HeadersInit | undefined,
    appendHeaders: Record<string, string>,
  ) {
    if (typeof Headers !== "undefined" && headers instanceof Headers) {
      const h: Record<string, string> = {};
      headers.forEach((v, k) => (h[k] = v));
      return { ...h, ...appendHeaders };
    }
    return { ...headers, ...appendHeaders };
  }

  private buildURL(url: string | URL) {
    if (typeof url === "string")
      return this.baseUrl && !this.isAbsoluteURL(url)
        ? this.joinURLs(this.baseUrl, url)
        : url;
    return new URL(url, this.baseUrl);
  }

  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  isAbsoluteURL(url: string) {
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
  }
  joinURLs(start: string, end: string): string {
    if (!start.endsWith("/") && !end.startsWith("/")) return `${start}/${end}`;
    return `${start}${end}`;
  }

  protected buildRequest(
    method: HttpMethod,
    url: string | URL,
    options?: RequestInit,
  ) {
    options = this.buildOptions(method, options);
    const requestUrl = this.buildURL(url);
    const requestContext: RequestContext = {
      url: requestUrl,
      options,
      cancelled: false,
      progress: 0,
    };
    if (this.beforeRequestInterceptors.length) {
      this.runBeforeRequestInterceptors(requestContext);
    }
    return requestContext;
  }

  protected buildResponse(res: Response, resultExtractor?: AfterResponse) {
    return Promise.resolve(res)
      .then((r) => (this.afterResponse ? this.afterResponse(r) : r))
      .then((r) => (resultExtractor ? resultExtractor(r) : r));
  }

  protected catchError(error: any, req: Request): Promise<never> {
    const apiError = toApiError(error, req);
    if (apiError.status === 401 && this.unauthorizedErrorHandler) {
      this.unauthorizedErrorHandler(apiError, req);
      return Promise.reject(apiError);
    }
    if (this.errorHandler) {
      try {
        this.errorHandler(apiError, req);
      } catch (e) {
        return Promise.reject(toApiError(e, req));
      }
    }
    return Promise.reject(apiError);
  }

  protected sendRequest(
    requestCtx: RequestContext,
    beforeSend?: BeforeRequest,
    resultExtractor?: AfterResponse,
  ) {
    const dispatch = () => {
      if (beforeSend) beforeSend(requestCtx);
      const request = new Request(requestCtx.url, requestCtx.options);
      return this.request(request)
        .then((res) => this.buildResponse(res, resultExtractor))
        .catch(async (error) => {
          if (this.isUnauthorized(error)) {
            const refreshed = await this.tryRefresh(requestCtx);
            if (refreshed) {
              this.runBeforeRequestInterceptors(requestCtx);
              if (beforeSend) beforeSend(requestCtx);
              const retry = new Request(requestCtx.url, requestCtx.options);
              return this.request(retry)
                .then((res) => this.buildResponse(res, resultExtractor))
                .catch((e) => this.catchError(e, retry));
            }
          }
          return this.catchError(error, request);
        });
    };
    return dispatch();
  }

  /**
   * get
   * @param url 请求访问网址
   * @param options 请求选项设置
   * @param beforeSend 请求前拦截器，比如组装额外的headers
   * @param resExtractor 响应后拦截器，比如处理json或者根据响应状态抛出异常
   * @returns
   */
  get(
    url: string | URL,
    { options, beforeSend, resExtractor }: HttpRequestParam,
  ) {
    const req = this.buildRequest(HttpMethod.GET, url, options);
    return this.sendRequest(req, beforeSend, resExtractor);
  }

  post(
    url: string | URL,
    { options, beforeSend, resExtractor }: HttpRequestParam,
  ) {
    const req = this.buildRequest(HttpMethod.POST, url, options);
    return this.sendRequest(req, beforeSend, resExtractor);
  }

  put(
    url: string | URL,
    { options, beforeSend, resExtractor }: HttpRequestParam,
  ) {
    const req = this.buildRequest(HttpMethod.PUT, url, options);
    return this.sendRequest(req, beforeSend, resExtractor);
  }

  delete(
    url: string | URL,
    { options, beforeSend, resExtractor }: HttpRequestParam,
  ) {
    const req = this.buildRequest(HttpMethod.DELETE, url, options);
    return this.sendRequest(req, beforeSend, resExtractor);
  }

  patch(
    url: string | URL,
    { options, beforeSend, resExtractor }: HttpRequestParam,
  ) {
    const req = this.buildRequest(HttpMethod.PATCH, url, options);
    return this.sendRequest(req, beforeSend, resExtractor);
  }

  head(
    url: string | URL,
    { options, beforeSend, resExtractor }: HttpRequestParam,
  ) {
    const req = this.buildRequest(HttpMethod.HEAD, url, options);
    return this.sendRequest(req, beforeSend, resExtractor);
  }

  options(
    url: string | URL,
    { options, beforeSend, resExtractor }: HttpRequestParam,
  ) {
    const req = this.buildRequest(HttpMethod.OPTIONS, url, options);
    return this.sendRequest(req, beforeSend, resExtractor);
  }

  //files
  private textExtractor = (res: Response) => res.text();
  private fileExtractor = (res: Response) => {
    const fileName = this._getFileName(res);
    return res.blob().then((blob) => this._downloadBlob(blob, fileName));
  };
  private _getFileName(res: Response) {
    const h = res.headers.get("Content-Disposition");
    if (h && h.indexOf("filename=") > 0) {
      const s = h.split("filename=");
      return decodeURIComponent(s[1]);
    }

    return DateTime.now()
      .toString()
      .replaceAll(/[\/|:|+|\.]/g, "_");
  }
  private _downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.style.display = "none";
    document.body.appendChild(a);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  downloadFile(
    url: string | URL,
    { options, beforeSend, resExtractor }: HttpRequestParam,
  ) {
    // const fileExtractor: AfterResponse = (res: Response) => res.blob()
    //   .then(blob=>URL.createObjectURL(blob));
    // .then(blob=>{
    // let file = new File([blob], blob.name, { type: blob.type });
    // const reader = new FileReader();
    // reader.addEventListener('loadend', () => {
    //   // reader.result 包含被转化为类型化数组的 blob 中的内容
    // });
    // reader.readAsArrayBuffer(blob);
    // });
    if (options.body) {
      options.body = this.buildJsonBody(options.body);
      // beforeSend = r => this.buildJsonHeaders(beforeSend)
    }
    const method: HttpMethod = (options.method ??
      HttpMethod.POST) as HttpMethod;
    const req = this.buildRequest(method, url, options);
    return this.sendRequest(
      req,
      beforeSend,
      resExtractor ?? this.fileExtractor,
    );
  }

  uploadFile(
    url: string | URL,
    fieldname: string,
    file: File,
    options?: RequestInit,
    beforeSend?: BeforeRequest,
    resExtractor: AfterResponse = this.textExtractor,
  ) {
    const formData = new FormData();
    formData.append(fieldname, file, file.name);
    return this.post(url, {
      options: { ...options, body: formData },
      beforeSend,
      resExtractor,
    });
  }
  uploadFiles(
    url: string | URL,
    fieldname: string,
    files: File[],
    options?: RequestInit,
    beforeSend?: BeforeRequest,
    resExtractor: AfterResponse = this.jsonExtractor,
  ) {
    const formData = new FormData();
    files.forEach((file) => formData.append(fieldname, file));
    return this.post(url, {
      options: { ...options, body: formData },
      beforeSend,
      resExtractor,
    });
  }

  ///json
  jsonExtractor(res: Response) {
    return res.json().then((data) => {
      if (isApiErrorPayload(data)) {
        return Promise.reject(toApiError(data));
      }
      return data;
    });
  }
  buildJsonHeaders(beforeRequest?: BeforeRequest) {
    return (ctx: RequestContext) => {
      if (beforeRequest) beforeRequest(ctx);
      ctx.options.headers = this.mergeHeaders(ctx.options.headers, {
        "Cache-Control": "no-cache",
        "Content-Type": ContentType.json,
        Accept: ContentType.json,
      });
    };
  }
  private buildJsonBody(data?: any) {
    return data ? JSON.stringify(data) : (data as BodyInit);
  }

  getJson(url: string | URL, { options, beforeSend }: HttpRequestParam = {}) {
    return this.get(url, {
      options,
      beforeSend: this.buildJsonHeaders(beforeSend),
      resExtractor: this.jsonExtractor,
    });
  }
  postJson(
    url: string | URL,
    data: any,
    { options, beforeSend }: HttpRequestParam = {},
  ) {
    return this.post(url, {
      options: { ...options, body: this.buildJsonBody(data) },
      beforeSend: this.buildJsonHeaders(beforeSend),
      resExtractor: this.jsonExtractor,
    });
  }
  postBlob(
    url: string | URL,
    data: any,
    { options, beforeSend }: HttpRequestParam = {},
  ) {
    return this.post(url, {
      options: { ...options, body: this.buildJsonBody(data) },
      beforeSend: this.buildJsonHeaders(beforeSend),
      resExtractor: (res: Response) => res.blob(),
    });
  }
  putJson(
    url: string | URL,
    data: any,
    { options, beforeSend }: HttpRequestParam = {},
  ) {
    return this.put(url, {
      options: { ...options, body: this.buildJsonBody(data) },
      beforeSend: this.buildJsonHeaders(beforeSend),
      resExtractor: this.jsonExtractor,
    });
  }
  patchJson(
    url: string | URL,
    data: any,
    { options, beforeSend }: HttpRequestParam = {},
  ) {
    return this.patch(url, {
      options: { ...options, body: this.buildJsonBody(data) },
      beforeSend: this.buildJsonHeaders(beforeSend),
      resExtractor: this.jsonExtractor,
    });
  }
  deleteJson(
    url: string | URL,
    data: any,
    { options, beforeSend }: HttpRequestParam = {},
  ) {
    return this.delete(url, {
      options: { ...options, body: this.buildJsonBody(data) },
      beforeSend: this.buildJsonHeaders(beforeSend),
      resExtractor: this.jsonExtractor,
    });
  }
}

export const supportFetch = typeof fetch === "function";

/**
 * 使用FetchAPI实现的网络客户端
 * @see {@link https://www.cnblogs.com/wonyun/p/fetch_polyfill_timeout_jsonp_cookie_progress.html|fetch使用的常见问题及解决办法}
 */
export class FetchClient extends HttpClient {
  static canAbort = typeof AbortController === "function";

  constructor(
    baseUrl?: string,
    beforeRequest?: BeforeRequest,
    includeCredentials = true,
    unauthorizedErrorHandler?: HttpErrorHandler,
  ) {
    super(baseUrl, beforeRequest, includeCredentials, unauthorizedErrorHandler);
    /*
    The Promise returned from fetch() won't reject on HTTP error status even if the response is an HTTP 404 or 500. 
    Instead, as soon as the server responds with headers, the Promise will resolve normally 
    (with the ok property of the response set to false if the response isn't in the range 200–299)
    */
    this.afterResponse = (response) =>
      new Promise((resolve, reject) => {
        if (!response.ok) {
          response
            .json()
            .then((r) => {
              const payload =
                r && typeof r === "object"
                  ? {
                      ...(r as object),
                      status: (r as { status?: number }).status ?? response.status,
                    }
                  : { status: response.status, message: r };
              reject(toApiError(payload));
            })
            .catch(() =>
              reject(
                toApiError({
                  status: response.status,
                  message: response.statusText,
                }),
              ),
            );
        } else {
          resolve(response);
        }
      });
  }

  // 重写sendRequest方法
  protected override sendRequest(
    requestCtx: RequestContext,
    beforeSend?: BeforeRequest,
    resultExtractor?: AfterResponse,
  ): Promise<any> {
    requestCtx.progress = 1;
    if (beforeSend) beforeSend(requestCtx);

    let controller: AbortController | undefined = undefined;
    let timer: number;

    if (FetchClient.canAbort) {
      controller = new AbortController();
      controller.signal.onabort = () => (requestCtx.cancelled = true);
      requestCtx.options = { ...requestCtx.options, signal: controller.signal };
    }

    const abort = () => {
      if (FetchClient.canAbort && controller) controller.abort();
    };
    if (requestCtx.cancelled || !supportFetch) {
      requestCtx.progress = 0;
      return Promise.resolve(null);
    }

    if (requestCtx.timeout) {
      timer = window.setTimeout(abort, requestCtx.timeout);
    }
    const request = new Request(requestCtx.url, requestCtx.options);
    return this.request(request)
      .then((res) => this.buildResponse(res, resultExtractor))
      .catch(async (error) => {
        if (this.isUnauthorized(error)) {
          const refreshed = await this.tryRefresh(requestCtx);
          if (refreshed) {
            this.runBeforeRequestInterceptors(requestCtx);
            if (beforeSend) beforeSend(requestCtx);
            const retry = new Request(requestCtx.url, requestCtx.options);
            return this.request(retry)
              .then((res) => this.buildResponse(res, resultExtractor))
              .catch((e) => this.catchError(e, retry));
          }
        }
        return this.catchError(error, request);
      })
      .finally(() => {
        requestCtx.progress = 100;
        if (timer) window.clearTimeout(timer);
      });
  }

  protected override request(input: URL | RequestInfo, init?: RequestInit) {
    return fetch(input, init);
  }
}
