import {
  ApiError,
  type ValidationError,
} from './api_error'

/**
 * RFC 9457 Problem Details 文档对象。
 *
 * 标准成员为 `type`、`title`、`status`、`detail`、`instance`；
 * 固定扩展仅 `validationErrors`（与 {@link ApiError.validationErrors} 同名）；
 * 其余未知成员由 {@link ApiProblem} 收入 `extensions`。
 *
 * @see https://www.rfc-editor.org/rfc/rfc9457.html
 */
export interface ProblemDetails {
  /**
   * 问题类型 URI。缺省为 `"about:blank"`。
   */
  type?: string
  /**
   * 面向人的短标题，应对同一 `type` 保持稳定。
   */
  title?: string
  /**
   * HTTP 状态码。客户端以响应状态行为准，不以 body 内字段覆盖。
   */
  status?: number
  /**
   * 本次问题的具体说明。
   */
  detail?: string
  /**
   * 本次问题发生位置的 URI。
   */
  instance?: string
  /**
   * 字段校验错误（固定扩展，对应 {@link ApiError.validationErrors}）。
   */
  validationErrors?: ValidationError[]
  /**
   * 其它扩展成员（如 `balance`、`code`）。
   */
  [member: string]: unknown
}

/**
 * 构造 {@link ApiProblem} 的选项。
 *
 * 除 RFC 标准成员与固定扩展外，可附带原始 `Response` / `Request`。
 */
export interface ApiProblemInit extends ProblemDetails {
  /** 触发该问题的 HTTP 响应（body 可能已被读取）。 */
  response?: Response
  /** 对应的 HTTP 请求。 */
  request?: Request
}

const STANDARD_MEMBERS = new Set([
  'type',
  'title',
  'status',
  'detail',
  'instance',
  'validationErrors',
  'cause',
  'response',
  'request',
])

const isUri = (value: string) => /^[a-z][a-z\d+\-.]*:/i.test(value)

const asValidationErrors = (
  value: unknown,
): ValidationError[] | undefined => {
  if (!Array.isArray(value)) return undefined
  const list = value.filter(
    (item): item is ValidationError =>
      !!item &&
      typeof item === 'object' &&
      typeof (item as ValidationError).field === 'string' &&
      typeof (item as ValidationError).error === 'string',
  )
  return list.length ? list : undefined
}

/**
 * HTTP API 的 RFC 9457 标准问题。
 *
 * 仅用于**服务端 HTTP 错误**（非 2xx 或 200 业务错误体）。网络失败、取消
 * （`AbortError`）和超时（`TimeoutError`）仍按 Fetch 原生 rejection，
 * 不会包装成本类。
 *
 * @example
 * ```ts
 * try {
 *   await http.getJson('/items')
 * } catch (error) {
 *   if (error instanceof ApiProblem) {
 *     console.error(error.status, error.type, error.detail)
 *   }
 * }
 * ```
 */
export class ApiProblem extends Error {
  /** 固定为 `'ApiProblem'`，便于 `instanceof` 与序列化识别。 */
  readonly name = 'ApiProblem'
  /**
   * 问题类型 URI。
   * @default "about:blank"
   */
  readonly type: string
  /** 面向人的短标题。 */
  readonly title: string
  /** HTTP 状态码（来自响应状态行）。 */
  readonly status?: number
  /** 本次问题的具体说明；同时作为 `Error.message` 优先值。 */
  readonly detail?: string
  /** 本次问题发生位置的 URI。 */
  readonly instance?: string
  /**
   * 字段校验错误（固定扩展）。
   */
  readonly validationErrors?: ValidationError[]
  /**
   * RFC 标准成员与固定扩展以外的字段（只读副本）。
   */
  readonly extensions: Readonly<Record<string, unknown>>
  /** 原始响应。 */
  readonly response?: Response
  /** 原始请求。 */
  readonly request?: Request

  /**
   * @param init 问题详情；缺省 `type` 为 `"about:blank"`，
   *   缺省 `title` 为 `"HTTP API problem"`。
   *   `cause` 只作为 {@link Error.cause}，不是 Problem Details 成员。
   */
  constructor(init: ApiProblemInit = {}) {
    const type = typeof init.type === 'string' ? init.type : 'about:blank'
    const title =
      typeof init.title === 'string' && init.title
        ? init.title
        : 'HTTP API problem'
    const detail = typeof init.detail === 'string' ? init.detail : undefined
    super(detail ?? title, { cause: init.cause })
    Object.setPrototypeOf(this, new.target.prototype)

    this.type = type
    this.title = title
    this.status =
      typeof init.status === 'number' && Number.isFinite(init.status)
        ? init.status
        : undefined
    this.detail = detail
    this.instance =
      typeof init.instance === 'string' ? init.instance : undefined
    this.validationErrors = asValidationErrors(init.validationErrors)
    this.response = init.response
    this.request = init.request
    this.extensions = Object.freeze(
      Object.fromEntries(
        Object.entries(init).filter(([key]) => !STANDARD_MEMBERS.has(key)),
      ),
    )
  }

  /**
   * 序列化为 RFC 9457 JSON 对象（含固定扩展与其它扩展，不含 `response` / `request`）。
   */
  toJSON(): ProblemDetails {
    return {
      type: this.type,
      title: this.title,
      status: this.status,
      detail: this.detail,
      instance: this.instance,
      validationErrors: this.validationErrors,
      ...this.extensions,
    }
  }
}

const asObject = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : undefined

const isAbortLike = (error: Error) =>
  error.name === 'AbortError' || error.name === 'TimeoutError'

/**
 * 按 Content-Type 读取错误体：JSON / problem+json 走 `json()`，其余走 `text()`。
 */
async function readErrorBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
  if (
    contentType.includes('application/problem+json') ||
    contentType.includes('application/json') ||
    contentType.includes('+json')
  ) {
    try {
      return await response.json()
    } catch {
      return undefined
    }
  }
  try {
    const text = await response.text()
    return text || undefined
  } catch {
    return undefined
  }
}

/**
 * 将非成功 HTTP Response 转为 {@link ApiProblem}。
 *
 * 优先解析 `application/problem+json`；其它 JSON 或文本会生成
 * `type: "about:blank"` 的标准问题。`status` 始终取 `response.status`，
 * 不以 body 内的 `status` 覆盖（防止伪造）。
 *
 * @param response 非 2xx 响应
 * @param request 可选，关联到问题对象便于诊断
 */
export async function responseToApiProblem(
  response: Response,
  request?: Request,
): Promise<ApiProblem> {
  const body = await readErrorBody(response)
  const object = asObject(body)
  const detail =
    typeof object?.detail === 'string'
      ? object.detail
      : typeof object?.message === 'string'
        ? object.message
        : typeof body === 'string'
          ? body
          : undefined
  const title =
    typeof object?.title === 'string'
      ? object.title
      : typeof object?.error === 'string'
        ? object.error
        : response.statusText || `HTTP ${response.status}`

  return new ApiProblem({
    ...(object ?? {}),
    type: typeof object?.type === 'string' ? object.type : 'about:blank',
    title,
    status: response.status,
    detail,
    validationErrors: asValidationErrors(object?.validationErrors),
    response,
    request,
  })
}

/**
 * 将未知错误统一为 {@link ApiProblem}。
 *
 * 已是 `ApiProblem` 则原样返回。`ApiError.validationErrors` 拷到同名字段；
 * `ApiError.cause` 只作为 {@link Error.cause}。取消与超时不转换，原样抛出。
 */
export function toApiProblem(error: unknown, request?: Request): ApiProblem {
  if (error instanceof ApiProblem) {
    if (request && !error.request) {
      return new ApiProblem({
        ...error.toJSON(),
        response: error.response,
        request,
        cause: error.cause,
      })
    }
    return error
  }
  if (error instanceof ApiError) {
    const code = error.code
    const type = code && isUri(code) ? code : 'about:blank'
    return new ApiProblem({
      type,
      title: error.error || error.message || 'HTTP API problem',
      status: error.status,
      detail: error.message,
      validationErrors: error.validationErrors,
      cause: error.cause,
      request: request ?? error.request,
      ...(code && !isUri(code) ? { code } : {}),
    })
  }
  if (error instanceof Error) {
    if (isAbortLike(error)) throw error
    return new ApiProblem({
      type: 'about:blank',
      title: error.name || 'HTTP API problem',
      detail: error.message,
      cause: error.cause,
      request,
    })
  }
  return new ApiProblem({
    type: 'about:blank',
    title: 'HTTP API problem',
    detail: error == null ? undefined : String(error),
    request,
  })
}
