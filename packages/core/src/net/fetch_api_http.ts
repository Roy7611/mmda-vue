import {
  HttpClient,
  type AfterResponse,
  type BeforeRequest,
  type HttpErrorHandler,
  type RequestContext,
} from './http'
import { isApiErrorPayload, toApiError } from './api_error'
import {
  responseToApiProblem,
  toApiProblem,
} from './api_problem'
import type { FetchApi } from './fetch_api'

/**
 * 把 {@link FetchApi} 接到旧 {@link HttpClient} 契约，供 {@link ApiClient} /
 * {@link OAuthApiClient} / {@link OAuth2ApiClient} 使用。
 *
 * 默认走 `fetchApi.raw`（原生 fetch 语义），认证仍由 `HttpClient` 拦截器处理。
 * {@link OAuth2ApiClient} 会打开 {@link applyFetchAuth}：业务请求走
 * `fetchApi.request`（Bearer + 401 刷新由 {@link FetchApi} 完成）。
 * 不要把 `OAuthApiClient.setAuthenticator` 和 FetchApi 上的 OAuth provider 叠用。
 *
 * @example
 * ```ts
 * const fetchApi = new FetchApi({
 *   baseUrl: 'https://api.example.com/',
 *   credentials: 'include',
 * })
 * const http = new FetchApiHttp(fetchApi)
 * const api = new OAuthApiClient(http, { service: 'wms' })
 * ```
 */
export class FetchApiHttp extends HttpClient {
  constructor(
    readonly fetchApi: FetchApi,
    initialBeforeRequest?: BeforeRequest,
    includeCredentials = fetchApi.credentials === 'include',
    unauthorizedErrorHandler?: HttpErrorHandler,
    /**
     * 为 true 时 `request` 走 {@link FetchApi.request}（注入 auth、非 2xx 抛
     * {@link ApiProblem}）。{@link OAuth2ApiClient} 使用此模式。
     */
    readonly applyFetchAuth = false,
  ) {
    super(
      fetchApi.baseUrl?.href,
      initialBeforeRequest,
      includeCredentials,
      unauthorizedErrorHandler,
    )
    this.afterResponse = (response) => {
      if (response.ok) return Promise.resolve(response)
      return responseToApiProblem(response).then((problem) =>
        Promise.reject(problem),
      )
    }
  }

  /**
   * `applyFetchAuth` 时：把已构造的 `Request` 转成可重放 body，交给
   * {@link FetchApi.request}（含认证与 401 重试）。登录 / refresh 通过
   * `skipAuthRefresh` 映射为 `auth: false`。
   *
   * 否则委托 {@link FetchApi.raw}。
   */
  protected override request(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    if (!this.applyFetchAuth) return this.fetchApi.raw(input, init)
    return this.forwardWithFetchAuth(input, init)
  }

  /**
   * FetchApi 已处理 401 重试，这里不再走 HttpClient 的 refreshHandler。
   */
  protected override sendRequest(
    requestCtx: RequestContext,
    beforeSend?: BeforeRequest,
    resultExtractor?: AfterResponse,
  ) {
    if (!this.applyFetchAuth) {
      return super.sendRequest(requestCtx, beforeSend, resultExtractor)
    }
    if (beforeSend) beforeSend(requestCtx)
    const request = new Request(requestCtx.url, requestCtx.options)
    const skipAuth = !!requestCtx.skipAuthRefresh
    return this.forwardWithFetchAuth(request, undefined, skipAuth)
      .then((res) => this.buildResponse(res, resultExtractor))
      .catch((error) => this.catchError(error, request))
  }

  private async forwardWithFetchAuth(
    input: RequestInfo | URL,
    init?: RequestInit,
    skipAuth = false,
  ): Promise<Response> {
    const req = input instanceof Request ? input : new Request(input, init)
    const method = req.method
    const replayable =
      method === 'GET' || method === 'HEAD'
        ? undefined
        : await req.arrayBuffer()
    const body =
      replayable && replayable.byteLength > 0 ? new Blob([replayable]) : undefined
    return this.fetchApi.request(req.url, {
      method,
      headers: req.headers,
      body,
      credentials: req.credentials,
      cache: req.cache,
      redirect: req.redirect,
      integrity: req.integrity,
      keepalive: req.keepalive,
      mode: req.mode,
      referrer: req.referrer,
      referrerPolicy: req.referrerPolicy,
      signal: req.signal,
      auth: skipAuth ? false : undefined,
    })
  }

  override jsonExtractor = (res: Response) =>
    res.json().then((data) => {
      if (isApiErrorPayload(data)) {
        return Promise.reject(toApiProblem(toApiError(data)))
      }
      return data
    })

  protected override catchError(error: unknown, req: Request): Promise<never> {
    if (
      error instanceof Error &&
      (error.name === 'AbortError' || error.name === 'TimeoutError')
    ) {
      return Promise.reject(error)
    }
    const problem = toApiProblem(error, req)
    if (problem.status === 401 && this.unauthorizedErrorHandler) {
      this.unauthorizedErrorHandler(problem, req)
      return Promise.reject(problem)
    }
    if (this.errorHandler) {
      try {
        this.errorHandler(problem, req)
      } catch (e) {
        if (e instanceof Error && (e.name === 'AbortError' || e.name === 'TimeoutError')) {
          return Promise.reject(e)
        }
        return Promise.reject(toApiProblem(e, req))
      }
    }
    return Promise.reject(problem)
  }
}
