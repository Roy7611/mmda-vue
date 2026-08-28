import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiClient } from '../net/api_client'
import { ApiError } from '../net/api_error'
import { ApiProblem, toApiProblem } from '../net/api_problem'
import { FetchApi } from '../net/fetch_api'
import { FetchApiHttp } from '../net/fetch_api_http'
import { OAuthApiClient } from '../net/oauth_api_client'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

function requestUrl(input: RequestInfo | URL) {
  return String(input instanceof Request ? input.url : input)
}

async function requestJson(input: RequestInfo | URL, init?: RequestInit) {
  const req =
    input instanceof Request ? input.clone() : new Request(input, init)
  try {
    return await req.json()
  } catch {
    return undefined
  }
}

describe('toApiProblem', () => {
  it('已是 ApiProblem 不二次包装', () => {
    const problem = new ApiProblem({ type: 'about:blank', status: 400 })
    expect(toApiProblem(problem)).toBe(problem)
  })

  it('将 ApiError 的 validationErrors 拷到同名字段，cause 只作 Error.cause', () => {
    const err = new ApiError(
      'VAL',
      'Invalid',
      'bad field',
      'root cause',
      422,
      [{ field: 'name', error: 'required' }],
    )
    const problem = toApiProblem(err)
    expect(problem).toBeInstanceOf(ApiProblem)
    expect(problem.status).toBe(422)
    expect(problem.title).toBe('Invalid')
    expect(problem.detail).toBe('bad field')
    expect(problem.type).toBe('about:blank')
    expect(problem.extensions.code).toBe('VAL')
    expect(problem.validationErrors).toEqual([
      { field: 'name', error: 'required' },
    ])
    expect(problem.cause).toBe('root cause')
    expect(problem.toJSON().cause).toBeUndefined()
  })

  it('URI 形态的 ApiError.code 作为 type', () => {
    const err = new ApiError(
      'https://example.test/problems/gone',
      undefined,
      'missing',
      undefined,
      404,
    )
    expect(toApiProblem(err).type).toBe('https://example.test/problems/gone')
  })
})

describe('FetchApiHttp', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('ApiClient.getOne 经适配器发出 GET JSON', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(requestUrl(input)).toContain('/Warehouses/w1')
      return jsonResponse({ id: 'w1' })
    })
    const http = new FetchApiHttp(
      new FetchApi({
        baseUrl: 'http://example.test/',
        credentials: 'include',
        fetch: fetchMock,
      }),
    )
    const api = new ApiClient(http, {
      service: 'wms',
      repository: 'Warehouses',
    })
    await expect(api.getOne('w1')).resolves.toEqual({ id: 'w1' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('useBeforeRequest 头能到 Request', async () => {
    const seen: string[] = []
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const req = input instanceof Request ? input : new Request(input)
      seen.push(req.headers.get('X-Locale') ?? '')
      return jsonResponse({ ok: true })
    })
    const http = new FetchApiHttp(
      new FetchApi({
        baseUrl: 'http://example.test/',
        fetch: fetchMock,
      }),
    )
    http.useBeforeRequest((ctx) => {
      ctx.options.headers = http.mergeHeaders(ctx.options.headers, {
        'X-Locale': 'zh-CN',
      })
    })
    await http.getJson('/items')
    expect(seen[0]).toBe('zh-CN')
  })

  it('HTTP 4xx 与 200 业务错误 reject 为 ApiProblem', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = requestUrl(input)
      if (url.includes('/http-fail')) {
        return jsonResponse({ code: 'GONE', message: 'missing' }, 404)
      }
      return jsonResponse({
        status: 409,
        code: 'DUP',
        message: 'exists',
        validationErrors: [{ field: 'code', error: 'taken' }],
      })
    })
    const http = new FetchApiHttp(
      new FetchApi({ baseUrl: 'http://example.test/', fetch: fetchMock }),
    )
    const api = new ApiClient(http, { service: 'wms', repository: 'items' })

    await expect(http.getJson('/http-fail')).rejects.toMatchObject({
      name: 'ApiProblem',
      status: 404,
      detail: 'missing',
      extensions: { code: 'GONE' },
    })
    await expect(http.getJson('/http-fail')).rejects.toBeInstanceOf(ApiProblem)

    await expect(api.getOne('1')).rejects.toBeInstanceOf(ApiProblem)
    await expect(api.getOne('1')).rejects.toMatchObject({
      status: 409,
      extensions: { code: 'DUP' },
      validationErrors: [{ field: 'code', error: 'taken' }],
    })
  })

  it('OAuthApiClient 并发 401 只刷新一次后重试', async () => {
    let refreshCount = 0
    let dataHits = 0
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = requestUrl(input)
      const body = await requestJson(input)
      if (
        url.includes('auth/authorize') &&
        body?.grant_type === 'refresh_token'
      ) {
        refreshCount += 1
        await new Promise((r) => setTimeout(r, 20))
        return jsonResponse({
          access_token: 'new-acc',
          refresh_token: 'ref',
          expires_in: 60,
        })
      }
      dataHits += 1
      if (dataHits <= 2) {
        return jsonResponse({ message: 'unauthorized' }, 401)
      }
      return jsonResponse({ ok: true })
    })

    const http = new FetchApiHttp(
      new FetchApi({
        baseUrl: 'http://example.test/',
        credentials: 'include',
        fetch: fetchMock,
      }),
    )
    const api = new OAuthApiClient(http, {
      service: 'api',
      accessToken: 'old',
      refreshToken: 'ref',
    })
    api.setAuthenticator()

    const [a, b] = await Promise.all([
      api.getOne('1', { repository: 'items' }),
      api.getOne('2', { repository: 'items' }),
    ])

    expect(refreshCount).toBe(1)
    expect(dataHits).toBe(4)
    expect(a).toEqual({ ok: true })
    expect(b).toEqual({ ok: true })
    expect(api.config.accessToken).toBe('new-acc')
  })
})
