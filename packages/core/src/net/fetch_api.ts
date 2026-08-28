import { ApiProblem, responseToApiProblem } from './api_problem'

/**
 * 传输字节进度。
 *
 * 上传：表示 ReadableStream 已生产并交给 Fetch 的字节，**不等于**服务端已接收。
 * 下载：表示已从 `Response.body` 读出的字节；`Content-Length` 存在时才有 `total`。
 */
export interface TransferProgress {
  /** 已处理字节数。 */
  loaded: number
  /** 已知总量（字节）。未知时为 `undefined`。 */
  total?: number
  /**
   * `loaded / total`，范围 0–1。
   * 无总量时为 `undefined`；总量为 0 时为 `1`。
   */
  progress?: number
}

/** 进度回调。 */
export type ProgressCallback = (progress: TransferProgress) => void

/**
 * 单次请求的认证上下文。
 *
 * `headers` 与 `url` 可被 provider 原地修改（例如写入 Authorization 或 query）。
 */
export interface FetchAuthContext {
  /** 已解析的请求 URL（含 query，可改）。 */
  url: URL
  /** 即将发出的请求头（可改）。 */
  headers: Headers
  /**
   * 尝试次数：`0` 为首次，`1` 为 401 刷新后的重试。
   */
  attempt: number
}

/**
 * 可插拔认证提供器。
 *
 * `authorize` 在每次发出请求前调用。`refresh` 在 401 时可选调用：
 * 返回 `true` 时客户端最多再发一次；并发 401 应由 provider 自行单飞。
 */
export interface FetchAuthProvider {
  /**
   * 向当前请求注入凭据。
   */
  authorize(context: FetchAuthContext): void | Promise<void>
  /**
   * 401 后刷新凭据。
   * @returns 是否允许用新凭据重试原请求
   */
  refresh?(
    problem: ApiProblem,
    context: FetchAuthContext,
  ): boolean | Promise<boolean>
}

/**
 * {@link FetchApi} 构造选项。
 */
export interface FetchApiOptions {
  /**
   * 相对 URL 的解析基址。缺省在浏览器下用 `location.href`；
   * Node / Worker 无 location 时必须对绝对 URL 发请求，或显式传入。
   */
  baseUrl?: string | URL
  /** 默认请求头，单次请求的 headers 会覆盖同名项。 */
  headers?: HeadersInit
  /**
   * Fetch `credentials`。
   * @default "same-origin"
   */
  credentials?: RequestCredentials
  /** 全局认证提供器；单次请求可用 `auth: false` 跳过。 */
  auth?: FetchAuthProvider
  /**
   * 自定义 `fetch`（测试或注入 undici）。
   * 缺省为 `globalThis.fetch`。
   */
  fetch?: typeof fetch
}

/**
 * 单次请求选项，基于 {@link RequestInit} 扩展取消、进度与认证。
 *
 * `body` 接受标准 `BodyInit`（string、Blob、FormData、ReadableStream 等）。
 * 传入 `ReadableStream` 且可能 401 重试时，必须同时提供 {@link bodyFactory}。
 */
export interface FetchRequestOptions
  extends Omit<RequestInit, 'body' | 'headers' | 'signal'> {
  headers?: HeadersInit
  body?: BodyInit | null
  /**
   * 每次尝试（含 401 重试）时创建全新 body。
   * JSON / Blob / 内部 multipart 流由客户端自动重建；调用方自备的
   * ReadableStream 不能重放，必须用此工厂。
   */
  bodyFactory?: () => BodyInit | null | Promise<BodyInit | null>
  /**
   * 自定义 ReadableStream 的总字节数，仅用于上传进度计算。
   * Blob 会使用 `blob.size`，无需设置。
   */
  uploadTotal?: number
  /**
   * 超时毫秒。优先 `AbortSignal.timeout()`，并与 `signal` 用
   * `AbortSignal.any()`（或兼容实现）合并。超时 reject `TimeoutError`。
   */
  timeout?: number
  /** 调用方取消信号；abort 时 reject `AbortError`。 */
  signal?: AbortSignal
  /**
   * 上传进度。需要运行时支持 `ReadableStream` 请求体 + `duplex: "half"`；
   * 不支持且仍传入时抛出 `TypeError`，不会伪造 0/100。
   */
  onUploadProgress?: ProgressCallback
  /**
   * 下载进度。通过包装 `response.body` 计数；有 `Content-Length` 时给出总量。
   */
  onDownloadProgress?: ProgressCallback
  /**
   * 覆盖全局认证：传入 provider 仅用于本次；
   * `false` 表示跳过认证（登录 / 刷新令牌请求应设置）。
   */
  auth?: FetchAuthProvider | false
}

/**
 * JSON 便捷方法的选项（不直接传 `body` / `bodyFactory`，由方法序列化）。
 */
export interface JsonRequestOptions
  extends Omit<FetchRequestOptions, 'body' | 'bodyFactory'> {}

/**
 * 多文件上传中的单个表单字段。
 */
export interface UploadFilePart {
  /** 表单字段名。 */
  fieldName: string
  /** 文件内容。 */
  data: Blob
  /**
   * 文件名。缺省使用 `File.name`，否则为 `"blob"`。
   */
  fileName?: string
}

/**
 * {@link FetchApi.uploadFile} / {@link FetchApi.uploadFiles} 选项。
 */
export interface FileUploadOptions extends JsonRequestOptions {
  /**
   * `uploadFile` 使用的表单字段名。
   * @default "file"
   */
  fieldName?: string
  /** `uploadFile` 使用的文件名。 */
  fileName?: string
  /** 一并提交的普通文本字段。 */
  fields?: Record<string, string | number | boolean>
}

/**
 * {@link FetchApi.downloadFile} 的返回值。
 * 核心层不触发浏览器下载，由应用自行保存 `blob`。
 */
export interface DownloadedFile {
  /** 响应体。 */
  blob: Blob
  /**
   * 从 `Content-Disposition` 解析的文件名（支持 `filename*` UTF-8）。
   */
  fileName?: string
  /** 原始响应（body 已被读出）。 */
  response: Response
}

type DuplexRequestInit = RequestInit & { duplex: 'half' }

const textEncoder = new TextEncoder()

const isReadableStream = (value: unknown): value is ReadableStream<Uint8Array> =>
  typeof ReadableStream !== 'undefined' && value instanceof ReadableStream

const progressValue = (loaded: number, total?: number): TransferProgress => ({
  loaded,
  total,
  progress:
    total === undefined
      ? undefined
      : total === 0
        ? 1
        : Math.min(1, loaded / total),
})

function withProgress(
  source: ReadableStream<Uint8Array>,
  callback: ProgressCallback,
  total?: number,
): ReadableStream<Uint8Array> {
  const reader = source.getReader()
  let loaded = 0
  let lastReported = -1
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const result = await reader.read()
      if (result.done) {
        if (lastReported !== loaded) callback(progressValue(loaded, total))
        controller.close()
        return
      }
      loaded += result.value.byteLength
      controller.enqueue(result.value)
      callback(progressValue(loaded, total))
      lastReported = loaded
    },
    cancel(reason) {
      return reader.cancel(reason)
    },
  })
}

let requestStreamingSupport: boolean | undefined

/**
 * 检测运行时是否接受 `ReadableStream` 请求体以及 `duplex: "half"`。
 *
 * Chromium 与 Node/undici 通常为 true；Firefox / Safari 等为 false。
 * 结果会缓存。无进度的 FormData / Blob 上传不依赖此能力。
 */
export function supportsStreamingRequest(): boolean {
  if (requestStreamingSupport !== undefined) return requestStreamingSupport
  if (typeof ReadableStream === 'undefined' || typeof Request === 'undefined') {
    return (requestStreamingSupport = false)
  }
  let duplexRead = false
  try {
    const request = new Request('https://example.invalid/', {
      method: 'POST',
      body: new ReadableStream(),
      get duplex() {
        duplexRead = true
        return 'half' as const
      },
    } as DuplexRequestInit)
    requestStreamingSupport =
      duplexRead && !request.headers.has('Content-Type')
  } catch {
    requestStreamingSupport = false
  }
  return requestStreamingSupport
}

function composeSignal(
  signal?: AbortSignal,
  timeout?: number,
): AbortSignal | undefined {
  const signals: AbortSignal[] = []
  if (signal) signals.push(signal)
  if (timeout !== undefined && timeout > 0) {
    if (typeof AbortSignal.timeout === 'function') {
      signals.push(AbortSignal.timeout(timeout))
    } else {
      const controller = new AbortController()
      globalThis.setTimeout(
        () =>
          controller.abort(
            new DOMException(`Timed out after ${timeout} ms`, 'TimeoutError'),
          ),
        timeout,
      )
      signals.push(controller.signal)
    }
  }
  if (signals.length === 0) return undefined
  if (signals.length === 1) return signals[0]
  if (typeof AbortSignal.any === 'function') return AbortSignal.any(signals)

  const controller = new AbortController()
  const abort = (source: AbortSignal) => {
    if (!controller.signal.aborted) controller.abort(source.reason)
  }
  for (const source of signals) {
    if (source.aborted) {
      abort(source)
      break
    }
    source.addEventListener('abort', () => abort(source), { once: true })
  }
  return controller.signal
}

function mergeHeaders(...sources: Array<HeadersInit | undefined>): Headers {
  const result = new Headers()
  for (const source of sources) {
    if (!source) continue
    new Headers(source).forEach((value, key) => result.set(key, value))
  }
  return result
}

function asBase64(value: string): string {
  const bytes = textEncoder.encode(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return globalThis.btoa(binary)
}

/**
 * HTTP Basic 认证。将 `username:password` 以 UTF-8 Base64 写入
 * `Authorization: Basic ...`。
 */
export class BasicAuthProvider implements FetchAuthProvider {
  /**
   * @param username 用户名
   * @param password 密码
   */
  constructor(
    private readonly username: string,
    private readonly password: string,
  ) {  }

  /** @inheritdoc */
  authorize({ headers }: FetchAuthContext) {
    headers.set(
      'Authorization',
      `Basic ${asBase64(`${this.username}:${this.password}`)}`,
    )
  }
}

/**
 * API Key 认证。可写入请求头或 query。
 *
 * @example
 * ```ts
 * new ApiKeyAuthProvider('X-API-Key', () => key)
 * new ApiKeyAuthProvider('api_key', () => key, 'query')
 * ```
 */
export class ApiKeyAuthProvider implements FetchAuthProvider {
  /**
   * @param name 头名或 query 参数名
   * @param getApiKey 同步或异步取 key
   * @param location `"header"`（默认）或 `"query"`
   */
  constructor(
    private readonly name: string,
    private readonly getApiKey: () => string | Promise<string>,
    private readonly location: 'header' | 'query' = 'header',
  ) {  }

  /** @inheritdoc */
  async authorize({ headers, url }: FetchAuthContext) {
    const value = await this.getApiKey()
    if (this.location === 'query') url.searchParams.set(this.name, value)
    else headers.set(this.name, value)
  }
}

/**
 * {@link OAuthBearerAuthProvider} 的令牌回调。
 *
 * 传输层不实现 OAuth token endpoint / password grant；
 * 由应用在回调里换票并更新本地 token。
 */
export interface OAuthBearerAuthOptions {
  /** 当前 access token；空值则不写 Authorization。 */
  getAccessToken: () =>
    | string
    | undefined
    | Promise<string | undefined>
  /**
   * 刷新 access token。应更新后续 `getAccessToken` 的返回值。
   * 并发调用由 provider 合并为一次。
   * @returns 是否刷新成功（失败则不再重试原请求）
   */
  refreshAccessToken?: () => boolean | Promise<boolean>
}

/**
 * OAuth / Bearer token 提供器。
 *
 * 请求前写入 `Authorization: Bearer <token>`。401 时调用
 * {@link OAuthBearerAuthOptions.refreshAccessToken}，并发刷新单飞；
 * 若刷新期间 token 已被其它请求更新，则直接允许重试而不再刷新。
 */
export class OAuthBearerAuthProvider implements FetchAuthProvider {
  private refreshInFlight?: Promise<boolean>
  private readonly tokenByRequest = new WeakMap<FetchAuthContext, string>()

  constructor(private readonly options: OAuthBearerAuthOptions) {}

  /** @inheritdoc */
  async authorize(context: FetchAuthContext) {
    const token = await this.options.getAccessToken()
    if (token) {
      context.headers.set('Authorization', `Bearer ${token}`)
      this.tokenByRequest.set(context, token)
    }
  }

  /**
   * 401 时刷新 token。并发调用合并为一次 `refreshAccessToken`。
   * @inheritdoc
   */
  async refresh(
    _problem: ApiProblem,
    context: FetchAuthContext,
  ): Promise<boolean> {
    if (!this.options.refreshAccessToken) return Promise.resolve(false)
    const currentToken = await this.options.getAccessToken()
    const requestToken = this.tokenByRequest.get(context)
    if (currentToken && requestToken && currentToken !== requestToken) return true
    if (!this.refreshInFlight) {
      this.refreshInFlight = Promise.resolve(
        this.options.refreshAccessToken(),
      ).finally(() => {
        this.refreshInFlight = undefined
      })
    }
    return this.refreshInFlight
  }
}

function streamFromIterator(
  iterator: AsyncIterator<Uint8Array>,
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async pull(controller) {
      const result = await iterator.next()
      if (result.done) controller.close()
      else controller.enqueue(result.value)
    },
    async cancel(reason) {
      await iterator.return?.(reason)
    },
  })
}

const encode = (value: string) => textEncoder.encode(value)
const quote = (value: string) =>
  value
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
    .replaceAll('\r', '')
    .replaceAll('\n', '')

function multipartHeader(
  boundary: string,
  fieldName: string,
  fileName?: string,
  contentType?: string,
) {
  const disposition = fileName
    ? `Content-Disposition: form-data; name="${quote(fieldName)}"; filename="${quote(fileName)}"\r\n`
    : `Content-Disposition: form-data; name="${quote(fieldName)}"\r\n`
  const type = contentType ? `Content-Type: ${contentType}\r\n` : ''
  return encode(`--${boundary}\r\n${disposition}${type}\r\n`)
}

function multipartDefinition(
  boundary: string,
  files: UploadFilePart[],
  fields: Record<string, string | number | boolean>,
) {
  const fieldParts = Object.entries(fields).map(([name, value]) => {
    const header = multipartHeader(boundary, name)
    const body = encode(`${String(value)}\r\n`)
    return { header, body }
  })
  const fileParts = files.map((part) => {
    const name =
      part.fileName ??
      ('name' in part.data && typeof part.data.name === 'string'
        ? part.data.name
        : 'blob')
    return {
      header: multipartHeader(
        boundary,
        part.fieldName,
        name,
        part.data.type || 'application/octet-stream',
      ),
      data: part.data,
      trailer: encode('\r\n'),
    }
  })
  const ending = encode(`--${boundary}--\r\n`)
  const total =
    fieldParts.reduce(
      (sum, part) => sum + part.header.byteLength + part.body.byteLength,
      0,
    ) +
    fileParts.reduce(
      (sum, part) =>
        sum +
        part.header.byteLength +
        part.data.size +
        part.trailer.byteLength,
      0,
    ) +
    ending.byteLength

  const create = () => {
    async function* chunks(): AsyncGenerator<Uint8Array> {
      for (const part of fieldParts) {
        yield part.header
        yield part.body
      }
      for (const part of fileParts) {
        yield part.header
        const reader = part.data.stream().getReader()
        try {
          while (true) {
            const result = await reader.read()
            if (result.done) break
            yield result.value
          }
        } finally {
          reader.releaseLock()
        }
        yield part.trailer
      }
      yield ending
    }
    return streamFromIterator(chunks())
  }
  return { create, total }
}

function contentDispositionFileName(response: Response): string | undefined {
  const value = response.headers.get('content-disposition')
  if (!value) return undefined
  const encoded = value.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  if (encoded) {
    try {
      return decodeURIComponent(encoded)
    } catch {
      return encoded
    }
  }
  return value.match(/filename="?([^";]+)"?/i)?.[1]
}

/**
 * 基于标准 Fetch API 的跨运行时 HTTP 客户端。
 *
 * 不继承旧 {@link HttpClient}，不依赖 `window` / `document`。
 * 非 2xx 抛出 {@link ApiProblem}；取消与超时保持 Fetch 原生 rejection。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 *
 * @remarks
 * 实现概要：
 *
 * - **动词**：`get` / `head` / `post` / `put` / `patch` / `delete` / `options` 返回
 *   `Response`；`request` 可自定义 method。相对 URL 用 `new URL()` 相对
 *   `baseUrl` 解析，请求头全程用 `Headers` 合并。
 * - **数据**：`getJson` / `postJson` / `putJson` / `patchJson` 编解码 JSON；另提供
 *   `getText` / `getBlob` / `getArrayBuffer` / `getStream`。原始 verb 的
 *   `body` 接受标准 `BodyInit`（string、Blob、FormData、ReadableStream 等）。
 * - **文件**：`uploadFile` / `uploadFiles` 默认走 FormData；传入
 *   `onUploadProgress` 时改为自建 multipart `ReadableStream` + `duplex: "half"`。
 *   `downloadFile` 只返回 Blob 与 `Content-Disposition` 文件名，不操作 DOM。
 * - **进度**：回调为 `{ loaded, total?, progress? }`。上传表示已交给 Fetch
 *   的字节，不是服务端已接收；下载来自消费 `Response.body`。运行时不支持
 *   流式请求时，无进度上传仍可用 FormData；显式要求进度则抛出 `TypeError`。
 * - **取消**：每请求接受 `signal` 与 `timeout`（`AbortSignal.timeout`，
 *   多信号用 `AbortSignal.any` 或兼容实现）。取消 / 超时分别为
 *   `AbortError` / `TimeoutError`，不包装成 {@link ApiProblem}。
 * - **错误**：非 2xx 优先解析 RFC 9457 `application/problem+json`，否则生成
 *   `type: "about:blank"` 的 {@link ApiProblem}；HTTP 状态以响应状态行为准。
 * - **认证**：可插拔 {@link FetchAuthProvider}。内置
 *   {@link OAuthBearerAuthProvider}（Bearer 注入 + 并发 401 单飞刷新一次）、
 *   {@link BasicAuthProvider}、{@link ApiKeyAuthProvider}。单次可用
 *   `auth: false` 跳过。OAuth token endpoint 不在本层。
 *   自定义 ReadableStream 若可能 401 重试，须提供 `bodyFactory`。
 * - **运行时**：浏览器、Worker、Node；`credentials` 默认 `same-origin`。
 *   可通过构造选项注入 `fetch` 便于测试。
 *
 * @example
 * ```ts
 * const http = new FetchApi({
 *   baseUrl: 'https://api.example.com/',
 *   auth: new OAuthBearerAuthProvider({ getAccessToken: () => token }),
 * })
 * const items = await http.getJson<Item[]>('items')
 * ```
 */
export class FetchApi {
  /** 相对路径解析基址。 */
  readonly baseUrl?: URL
  /** 默认请求头（每次请求会复制后再合并单次 headers）。 */
  readonly headers: Headers
  /** 默认 `credentials`。 */
  readonly credentials: RequestCredentials
  /**
   * 全局认证提供器。构造后可赋值（例如 {@link OAuth2ApiClient} 安装
   * {@link OAuthBearerAuthProvider}）。
   */
  auth?: FetchAuthProvider
  private readonly fetchFn: typeof fetch

  /**
   * @param options 基址、默认头、凭据模式、认证与自定义 fetch
   */
  constructor(options: FetchApiOptions = {}) {
    const base =
      options.baseUrl ??
      (typeof globalThis.location !== 'undefined'
        ? globalThis.location.href
        : undefined)
    this.baseUrl = base ? new URL(base) : undefined
    this.headers = new Headers(options.headers)
    this.credentials = options.credentials ?? 'same-origin'
    this.auth = options.auth
    this.fetchFn = options.fetch ?? globalThis.fetch.bind(globalThis)
  }

  /**
   * 将相对或绝对 URL 解析为绝对 `URL`。
   * 相对路径相对 {@link baseUrl}（或浏览器 `location`）。
   */
  resolveUrl(input: string | URL): URL {
    if (input instanceof URL) return new URL(input)
    if (this.baseUrl) return new URL(input, this.baseUrl)
    return new URL(input)
  }

  private async createBody(
    options: FetchRequestOptions,
  ): Promise<BodyInit | null | undefined> {
    const body = options.bodyFactory
      ? await options.bodyFactory()
      : options.body
    if (!options.onUploadProgress || body == null) return body
    if (!supportsStreamingRequest()) {
      throw new TypeError(
        'This runtime does not support ReadableStream request bodies with duplex: half',
      )
    }
    if (body instanceof Blob) {
      return withProgress(body.stream(), options.onUploadProgress, body.size)
    }
    if (isReadableStream(body)) {
      return withProgress(
        body,
        options.onUploadProgress,
        options.uploadTotal,
      )
    }
    throw new TypeError(
      'Upload progress requires a Blob or ReadableStream body',
    )
  }

  /**
   * 发送请求：解析 URL、合并头、注入认证、合成 AbortSignal。
   * 非 2xx 转为 ApiProblem；401 且 provider.refresh 成功时最多重试一次。
   * 无 bodyFactory 的 ReadableStream 不可重试。
   */
  private async send(
    input: string | URL,
    options: FetchRequestOptions,
  ): Promise<Response> {
    const {
      body: _body,
      bodyFactory: _bodyFactory,
      uploadTotal: _uploadTotal,
      timeout,
      signal,
      onUploadProgress: _onUploadProgress,
      onDownloadProgress,
      auth: requestAuth,
      headers: requestHeaders,
      ...requestInit
    } = options
    const provider = requestAuth === false ? undefined : requestAuth ?? this.auth
    const staticStream = isReadableStream(options.body) && !options.bodyFactory

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const url = this.resolveUrl(input)
      const headers = mergeHeaders(this.headers, requestHeaders)
      const authContext: FetchAuthContext = { url, headers, attempt }
      await provider?.authorize(authContext)
      const body = await this.createBody(options)
      const init: RequestInit = {
        ...requestInit,
        headers,
        body,
        credentials: requestInit.credentials ?? this.credentials,
        signal: composeSignal(signal, timeout),
      }
      if (isReadableStream(body)) {
        ;(init as DuplexRequestInit).duplex = 'half'
      }
      const request = new Request(url, init as DuplexRequestInit)
      const response = await this.fetchFn(request)
      if (response.ok) {
        return onDownloadProgress
          ? this.withDownloadProgress(response, onDownloadProgress)
          : response
      }

      const problem = await responseToApiProblem(response, request)
      if (
        response.status === 401 &&
        attempt === 0 &&
        !staticStream &&
        provider?.refresh &&
        (await provider.refresh(problem, authContext))
      ) {
        continue
      }
      throw problem
    }
    throw new Error('Unreachable request state')
  }

  /**
   * 原始 `fetch`，不解析 baseUrl、不注入认证、不把非 2xx 转为 {@link ApiProblem}。
   *
   * 供 {@link FetchApiHttp} 实现 `HttpClient.request`：行为与原生 fetch 一致，
   * 即使 HTTP 4xx/5xx 也 resolve 出 {@link Response}。
   */
  raw(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    return this.fetchFn(input, init)
  }

  /**
   * 发送请求。`method` 等取自 `options`，缺省为 GET。
   * @returns 成功时的 {@link Response}（`ok === true`）
   * @throws {ApiProblem} HTTP 非 2xx
   */
  request(
    input: string | URL,
    options: FetchRequestOptions = {},
  ): Promise<Response> {
    return this.send(input, options)
  }

  /** HTTP GET，返回 {@link Response}。 */
  get(input: string | URL, options: FetchRequestOptions = {}) {
    return this.send(input, { ...options, method: 'GET' })
  }

  /**
   * HTTP HEAD，返回 {@link Response}（通常无 body，用于探测资源与响应头）。
   */
  head(input: string | URL, options: FetchRequestOptions = {}) {
    return this.send(input, { ...options, method: 'HEAD' })
  }

  /** HTTP POST，返回 {@link Response}。 */
  post(input: string | URL, options: FetchRequestOptions = {}) {
    return this.send(input, { ...options, method: 'POST' })
  }

  /** HTTP PUT，返回 {@link Response}。 */
  put(input: string | URL, options: FetchRequestOptions = {}) {
    return this.send(input, { ...options, method: 'PUT' })
  }

  /** HTTP PATCH，返回 {@link Response}。 */
  patch(input: string | URL, options: FetchRequestOptions = {}) {
    return this.send(input, { ...options, method: 'PATCH' })
  }

  /** HTTP DELETE，返回 {@link Response}。 */
  delete(input: string | URL, options: FetchRequestOptions = {}) {
    return this.send(input, { ...options, method: 'DELETE' })
  }

  /** HTTP OPTIONS，返回 {@link Response}。 */
  options(input: string | URL, options: FetchRequestOptions = {}) {
    return this.send(input, { ...options, method: 'OPTIONS' })
  }

  private jsonHeaders(headers?: HeadersInit, hasBody = false) {
    const result = mergeHeaders(headers)
    result.set('Accept', 'application/json, application/problem+json')
    if (hasBody) result.set('Content-Type', 'application/json')
    return result
  }

  private async readJson<T>(response: Response): Promise<T> {
    if (response.status === 204 || response.status === 205) {
      return undefined as T
    }
    return response.json() as Promise<T>
  }

  /**
   * GET 并解析 JSON。`Accept` 含 `application/json` 与 `application/problem+json`。
   * 204 / 205 返回 `undefined`。
   */
  async getJson<T = unknown>(
    input: string | URL,
    options: JsonRequestOptions = {},
  ): Promise<T> {
    const response = await this.get(input, {
      ...options,
      headers: this.jsonHeaders(options.headers),
    })
    return this.readJson<T>(response)
  }

  /**
   * POST JSON 体并解析 JSON 响应。
   * `data === undefined` 时不写 `Content-Type` 与 body。
   */
  async postJson<T = unknown>(
    input: string | URL,
    data?: unknown,
    options: JsonRequestOptions = {},
  ): Promise<T> {
    const response = await this.post(input, {
      ...options,
      headers: this.jsonHeaders(options.headers, data !== undefined),
      body: data === undefined ? undefined : JSON.stringify(data),
    })
    return this.readJson<T>(response)
  }

  /**
   * PUT JSON 体并解析 JSON 响应。
   * `data === undefined` 时不写 `Content-Type` 与 body。
   */
  async putJson<T = unknown>(
    input: string | URL,
    data?: unknown,
    options: JsonRequestOptions = {},
  ): Promise<T> {
    const response = await this.put(input, {
      ...options,
      headers: this.jsonHeaders(options.headers, data !== undefined),
      body: data === undefined ? undefined : JSON.stringify(data),
    })
    return this.readJson<T>(response)
  }

  /**
   * PATCH JSON 体并解析 JSON 响应。
   * `data === undefined` 时不写 `Content-Type` 与 body。
   */
  async patchJson<T = unknown>(
    input: string | URL,
    data?: unknown,
    options: JsonRequestOptions = {},
  ): Promise<T> {
    const response = await this.patch(input, {
      ...options,
      headers: this.jsonHeaders(options.headers, data !== undefined),
      body: data === undefined ? undefined : JSON.stringify(data),
    })
    return this.readJson<T>(response)
  }

  /** GET，将响应体读为文本。 */
  async getText(input: string | URL, options: FetchRequestOptions = {}) {
    return (await this.get(input, options)).text()
  }

  /** GET，将响应体读为 {@link Blob}。 */
  async getBlob(input: string | URL, options: FetchRequestOptions = {}) {
    return (await this.get(input, options)).blob()
  }

  /** GET，将响应体读为 {@link ArrayBuffer}。 */
  async getArrayBuffer(
    input: string | URL,
    options: FetchRequestOptions = {},
  ) {
    return (await this.get(input, options)).arrayBuffer()
  }

  /**
   * GET，返回响应体流。调用方负责消费。
   * @throws {TypeError} 响应没有 body
   */
  async getStream(
    input: string | URL,
    options: FetchRequestOptions = {},
  ): Promise<ReadableStream<Uint8Array>> {
    const response = await this.get(input, options)
    if (!response.body) throw new TypeError('Response has no readable body')
    return response.body
  }

  private withDownloadProgress(
    response: Response,
    callback: ProgressCallback,
  ): Response {
    if (!response.body) return response
    const length = Number(response.headers.get('content-length'))
    const total = Number.isFinite(length) && length >= 0 ? length : undefined
    return new Response(withProgress(response.body, callback, total), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  }

  /**
   * 上传单个文件（`multipart/form-data`）。
   * 无 `onUploadProgress` 时走标准 {@link FormData}；
   * 有进度回调时走流式 multipart（需 {@link supportsStreamingRequest}）。
   */
  uploadFile(
    input: string | URL,
    file: Blob,
    options: FileUploadOptions = {},
  ) {
    return this.uploadFiles(
      input,
      [
        {
          fieldName: options.fieldName ?? 'file',
          data: file,
          fileName: options.fileName,
        },
      ],
      options,
    )
  }

  /**
   * 上传多个文件字段。行为同 {@link uploadFile}。
   * 不要手动设置 `Content-Type: multipart/form-data`（无进度路径由浏览器补 boundary）。
   */
  uploadFiles(
    input: string | URL,
    files: UploadFilePart[],
    options: FileUploadOptions = {},
  ): Promise<Response> {
    const {
      fields = {},
      onUploadProgress,
      fieldName: _fieldName,
      fileName: _fileName,
      headers,
      ...requestOptions
    } = options

    if (!onUploadProgress) {
      const form = new FormData()
      for (const [name, value] of Object.entries(fields)) {
        form.append(name, String(value))
      }
      for (const part of files) {
        const name =
          part.fileName ??
          ('name' in part.data && typeof part.data.name === 'string'
            ? part.data.name
            : 'blob')
        form.append(part.fieldName, part.data, name)
      }
      return this.post(input, {
        ...requestOptions,
        headers,
        body: form,
      })
    }

    if (!supportsStreamingRequest()) {
      return Promise.reject(
        new TypeError(
          'Upload progress is unavailable because this runtime does not support streaming requests',
        ),
      )
    }
    const boundary = `mmda-${globalThis.crypto.randomUUID()}`
    const multipart = multipartDefinition(boundary, files, fields)
    const multipartHeaders = mergeHeaders(headers)
    multipartHeaders.set(
      'Content-Type',
      `multipart/form-data; boundary=${boundary}`,
    )
    return this.post(input, {
      ...requestOptions,
      headers: multipartHeaders,
      bodyFactory: multipart.create,
      uploadTotal: multipart.total,
      onUploadProgress,
    })
  }

  /**
   * GET 下载为 {@link DownloadedFile}。
   * 不创建 `<a download>`，应用自行保存 `blob`。
   * 可配合 `onDownloadProgress`。
   */
  async downloadFile(
    input: string | URL,
    options: FetchRequestOptions = {},
  ): Promise<DownloadedFile> {
    const response = await this.get(input, options)
    return {
      blob: await response.blob(),
      fileName: contentDispositionFileName(response),
      response,
    }
  }
}
