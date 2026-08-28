import { afterEach, describe, expect, it, vi } from 'vitest'
import { OAuthBearerAuthProvider, FetchApi } from '../net/fetch_api'
import { OAuth2ApiClient } from '../net/oauth_api_client'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

function requestUrl(input: RequestInfo | URL) {
  return String(input instanceof Request ? input.url : input)
}

function requestAuth(input: RequestInfo | URL, init?: RequestInit) {
  const req =
    input instanceof Request ? input : new Request(input, init)
  return req.headers.get('Authorization')
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

describe('OAuth2ApiClient', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('已有 FetchApi.auth 时拒绝构造', () => {
    const fetchApi = new FetchApi({
      baseUrl: 'http://example.test/',
      auth: new OAuthBearerAuthProvider({ getAccessToken: () => 'x' }),
    })
    expect(() => new OAuth2ApiClient(fetchApi, { service: 'api' })).toThrow(
      /without auth/,
    )
  })

  it('authenticate 写入 token，登录请求不带 Authorization', async () => {
    let loginAuth: string | null = null
    let body: Record<string, unknown> | undefined
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      loginAuth = requestAuth(input, init)
      body = await requestJson(input, init)
      return jsonResponse({
        access_token: 'acc',
        refresh_token: 'ref',
        expires_in: 3600,
        userID: 'u1',
        username: 'alice',
        acct_type: 0,
        tenantID: 't1',
      })
    })
    const fetchApi = new FetchApi({
      baseUrl: 'http://example.test/',
      fetch: fetchMock,
    })
    const api = new OAuth2ApiClient(fetchApi, {
      service: 'api',
      accessToken: 'stale',
    })
    const before = Date.now()
    const user = await api.authenticate('alice', 'p', 'cid', 'csec')
    const after = Date.now()

    expect(loginAuth).toBeNull()
    expect(body?.client_id).toBe('cid')
    expect(body?.grant_type).toBe('password')
    expect(api.config.accessToken).toBe('acc')
    expect(user.expiryOn).toBeGreaterThanOrEqual(before + 3600_000)
    expect(user.expiryOn).toBeLessThanOrEqual(after + 3600_000)
  })

  it('缺少 clientId / clientSecret 时拒绝认证', async () => {
    const fetchMock = vi.fn()
    const api = new OAuth2ApiClient(
      new FetchApi({ baseUrl: 'http://example.test/', fetch: fetchMock }),
      { service: 'api' },
    )
    await expect(api.authenticate('a', 'b', '', 'secret')).rejects.toThrow(
      /clientId and clientSecret/,
    )
    await expect(api.authenticate('a', 'b', 'id', '  ')).rejects.toThrow(
      /clientId and clientSecret/,
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('业务请求带 Bearer，并发 401 只刷新一次后重试', async () => {
    let refreshCount = 0
    let dataHits = 0
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input)
      const body = await requestJson(input, init)
      if (
        url.includes('auth/authorize') &&
        body?.grant_type === 'refresh_token'
      ) {
        expect(requestAuth(input, init)).toBeNull()
        refreshCount += 1
        await new Promise((r) => setTimeout(r, 20))
        return jsonResponse({
          access_token: 'new-acc',
          refresh_token: 'ref',
          expires_in: 60,
        })
      }
      dataHits += 1
      const authorization = requestAuth(input, init)
      if (dataHits <= 2) {
        expect(authorization).toBe('Bearer old')
        return jsonResponse({ message: 'unauthorized' }, 401)
      }
      expect(authorization).toBe('Bearer new-acc')
      return jsonResponse({ ok: true })
    })

    const api = new OAuth2ApiClient(
      new FetchApi({
        baseUrl: 'http://example.test/',
        credentials: 'include',
        fetch: fetchMock,
      }),
      {
        service: 'api',
        accessToken: 'old',
        refreshToken: 'ref',
      },
    )

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

  it('没有 refresh_token 时 refreshToken 返回 false 且不发请求', async () => {
    const fetchMock = vi.fn()
    const api = new OAuth2ApiClient(
      new FetchApi({ baseUrl: 'http://example.test/', fetch: fetchMock }),
      { service: 'api', accessToken: 'acc' },
    )
    await expect(api.refreshToken()).resolves.toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('refresh 失败时返回 false 且保留旧 access_token', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ message: 'invalid' }, 400))
    const api = new OAuth2ApiClient(
      new FetchApi({ baseUrl: 'http://example.test/', fetch: fetchMock }),
      { service: 'api', accessToken: 'old', refreshToken: 'bad' },
    )
    await expect(api.refreshToken()).resolves.toBe(false)
    expect(api.config.accessToken).toBe('old')
  })
})
