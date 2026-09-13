import { ApiProblem } from '../../net/api_problem'
import type { UiProps } from '../props'
import { uiCssClass } from '../css'

export type UiErrorStatus = 'error' | 'unavailable' | 'network'

/**
 * 页级异常重试面板（非 Toast / 非 pageNotice）。
 * `error` 可直接传 {@link ApiProblem}；显式 title / description / status 覆盖解析结果。
 */
export interface UiErrorProps extends UiProps {
  /** 原始错误；优先于手写 title/description/status 的解析来源 */
  error?: unknown
  title?: string
  description?: string
  retryLabel?: string
  status?: UiErrorStatus
  onRetry?: () => void
}

const GENERIC_HTTP_STATUS_TEXT =
  /^(Service Unavailable|Bad Gateway|Gateway Timeout|Unauthorized|Forbidden|Not Found|Internal Server Error|Bad Request|Conflict|Too Many Requests)$/i

const NETWORK_MESSAGE =
  /failed to fetch|networkerror|network error|load failed|econnrefused|err_connection/i

function nonempty(value?: string): string | undefined {
  const text = value?.trim()
  return text ? text : undefined
}

function isGenericHttpStatusText(value: string): boolean {
  return GENERIC_HTTP_STATUS_TEXT.test(value.trim())
}

function isUnavailableStatus(status?: number): boolean {
  return status === 502 || status === 503 || status === 504
}

export function isNetworkFailure(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  if (error.name === 'AbortError' || error.name === 'TimeoutError') return false
  if (error.name === 'NetworkError') return true
  const message = error.message.toLowerCase()
  if (NETWORK_MESSAGE.test(message)) return true
  return error.name === 'TypeError' && /fetch|network|load failed/i.test(message)
}

/**
 * 从未知错误抽出重试页展示字段。不调用 {@link import('../../net/api_problem').toApiProblem}，
 * 以免把取消 / 超时吞掉。
 */
export function errorPropsOf(
  error: unknown,
): Pick<UiErrorProps, 'title' | 'description' | 'status'> {
  if (error instanceof ApiProblem) {
    const title = nonempty(error.title)
    return {
      title:
        title && !isGenericHttpStatusText(title) ? title : undefined,
      description: nonempty(error.detail) ?? nonempty(error.message),
      status: isUnavailableStatus(error.status) ? 'unavailable' : 'error',
    }
  }
  if (error instanceof Error) {
    return {
      description: nonempty(error.message),
      status: isNetworkFailure(error) ? 'network' : 'error',
    }
  }
  if (error == null) return { status: 'error' }
  return { description: String(error), status: 'error' }
}

/** 显式字段覆盖从 `error` 解析出的值。 */
export function errorDisplayOf(props: UiErrorProps = {}): {
  title?: string
  description?: string
  status: UiErrorStatus
} {
  const parsed = props.error !== undefined ? errorPropsOf(props.error) : {}
  return {
    title: nonempty(props.title) ?? parsed.title,
    description: nonempty(props.description) ?? parsed.description,
    status: props.status ?? parsed.status ?? 'error',
  }
}

export function errorModifierClasses(props: UiErrorProps = {}): unknown[] {
  const { status } = errorDisplayOf(props)
  return [
    uiCssClass('error-retry'),
    uiCssClass('error-retry', undefined, status),
    props.class,
  ]
}
