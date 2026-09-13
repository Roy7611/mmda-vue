import { describe, expect, it } from 'vitest'
import { ApiProblem } from '../net/api_problem'
import {
  errorDisplayOf,
  errorModifierClasses,
  errorPropsOf,
  isNetworkFailure,
} from '../ui/factory/error'

describe('errorPropsOf', () => {
  it('ApiProblem 503 → unavailable + detail', () => {
    const problem = new ApiProblem({
      status: 503,
      title: 'Service Unavailable',
      detail: '基础服务不可用，请确认 mmda-base 等后端服务已启动',
    })
    expect(errorPropsOf(problem)).toEqual({
      title: undefined,
      description: '基础服务不可用，请确认 mmda-base 等后端服务已启动',
      status: 'unavailable',
    })
  })

  it('ApiProblem 502 / 504 → unavailable', () => {
    expect(errorPropsOf(new ApiProblem({ status: 502, detail: '网关错误' })).status).toBe(
      'unavailable',
    )
    expect(errorPropsOf(new ApiProblem({ status: 504, detail: '超时' })).status).toBe(
      'unavailable',
    )
  })

  it('ApiProblem 非网关状态 → error，保留非英文 statusText 的 title', () => {
    const problem = new ApiProblem({
      status: 404,
      title: '物料不存在',
      detail: '编号 32500 已删除',
    })
    expect(errorPropsOf(problem)).toEqual({
      title: '物料不存在',
      description: '编号 32500 已删除',
      status: 'error',
    })
  })

  it('普通 Error → error + message', () => {
    expect(errorPropsOf(new Error('仓库元数据未加载'))).toEqual({
      description: '仓库元数据未加载',
      status: 'error',
    })
  })

  it('断网 TypeError → network', () => {
    const error = new TypeError('Failed to fetch')
    expect(isNetworkFailure(error)).toBe(true)
    expect(errorPropsOf(error)).toEqual({
      description: 'Failed to fetch',
      status: 'network',
    })
  })

  it('AbortError / TimeoutError 不当网络失败', () => {
    const abort = new Error('aborted')
    abort.name = 'AbortError'
    expect(isNetworkFailure(abort)).toBe(false)
    expect(errorPropsOf(abort).status).toBe('error')
  })
})

describe('errorDisplayOf', () => {
  it('显式字段覆盖从 error 解析的值', () => {
    const problem = new ApiProblem({
      status: 503,
      title: 'Service Unavailable',
      detail: '基础服务不可用',
    })
    expect(
      errorDisplayOf({
        error: problem,
        title: '无法加载页面',
        status: 'error',
      }),
    ).toEqual({
      title: '无法加载页面',
      description: '基础服务不可用',
      status: 'error',
    })
  })

  it('拼 error-retry 修饰 class', () => {
    const classes = errorModifierClasses({
      error: new ApiProblem({ status: 503, detail: 'down' }),
    })
    expect(classes).toContain('mmda-error-retry')
    expect(classes).toContain('mmda-error-retry--unavailable')
  })
})
