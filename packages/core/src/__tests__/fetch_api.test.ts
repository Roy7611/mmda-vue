import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiProblem } from '../net/api_problem'
import {
  ApiKeyAuthProvider,
  BasicAuthProvider,
  FetchApi,
  OAuthBearerAuthProvider,
  supportsStreamingRequest,
  type TransferProgress,
} from '../net/fetch_api'

const jsonResponse = (body: unknown, status = 200, statusText = '') =>
  new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: { 'Content-Type': 'application/json' },
  })

describe('FetchApi', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('使用标准 method、URL、Headers 和 JSON body', async () => {
    const requests: Request[] = []
    const client = new FetchApi({
      baseUrl: 'https://example.test/api/',
      headers: { 'X-App': 'mmda' },
      fetch: vi.fn(async (input: RequestInfo | URL) => {
        const request = input as Request
        requests.push(request)
        return jsonResponse({ ok: true })
      }),
    })

    await expect(client.getJson<{ ok: boolean }>('items')).resolves.toEqual({
      ok: true,
    })
    await client.postJson('items', { name: 'A' })
    await client.putJson('items/1', { name: 'B' })
    await client.patchJson('items/1', { name: 'C' })
    await client.delete('items/1')
    await client.head('items/1')
    await client.options('items')

    expect(requests.map((request) => request.method)).toEqual([
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'HEAD',
      'OPTIONS',
    ])
    expect(requests[0].url).toBe('https://example.test/api/items')
    expect(requests[1].headers.get('content-type')).toBe('application/json')
    await expect(requests[1].clone().json()).resolves.toEqual({ name: 'A' })
    expect(requests[0].headers.get('x-app')).toBe('mmda')
  })

  it('将 RFC 9457 和普通 HTTP 错误标准化为 ApiProblem', async () => {
    const problemClient = new FetchApi({
      fetch: vi.fn(async () =>
        new Response(
          JSON.stringify({
            type: 'https://example.test/problems/out-of-credit',
            title: 'Insufficient credit',
            detail: 'Balance is too low',
            balance: 30,
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/problem+json' },
          },
        ),
      ),
    })

    const problem = await problemClient
      .get('https://example.test/orders')
      .catch((error) => error)
    expect(problem).toBeInstanceOf(ApiProblem)
    expect(problem).toMatchObject({
      type: 'https://example.test/problems/out-of-credit',
      title: 'Insufficient credit',
      status: 403,
      detail: 'Balance is too low',
      extensions: { balance: 30 },
    })

    const textClient = new FetchApi({
      fetch: vi.fn(async () =>
        new Response('Unavailable', { status: 503, statusText: 'Offline' }),
      ),
    })
    await expect(textClient.get('https://example.test')).rejects.toMatchObject({
      name: 'ApiProblem',
      type: 'about:blank',
      title: 'Offline',
      status: 503,
      detail: 'Unavailable',
    })
  })

  it('保留 AbortSignal 的标准取消 rejection', async () => {
    const controller = new AbortController()
    const client = new FetchApi({
      fetch: vi.fn(
        (input: RequestInfo | URL) =>
          new Promise<Response>((_resolve, reject) => {
            const signal = (input as Request).signal
            const abort = () => reject(signal.reason)
            if (signal.aborted) abort()
            else signal.addEventListener('abort', abort, { once: true })
          }),
      ),
    })

    const promise = client.get('https://example.test/slow', {
      signal: controller.signal,
    })
    controller.abort()
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('timeout 使用标准 TimeoutError rejection', async () => {
    const client = new FetchApi({
      fetch: vi.fn(
        (input: RequestInfo | URL) =>
          new Promise<Response>((_resolve, reject) => {
            const signal = (input as Request).signal
            signal.addEventListener('abort', () => reject(signal.reason), {
              once: true,
            })
          }),
      ),
    })

    await expect(
      client.get('https://example.test/slow', { timeout: 5 }),
    ).rejects.toMatchObject({ name: 'TimeoutError' })
  })

  it('读取响应流时报告下载字节进度', async () => {
    const progress: TransferProgress[] = []
    const client = new FetchApi({
      fetch: vi.fn(async () =>
        new Response(new Blob(['abcdef']).stream(), {
          headers: { 'Content-Length': '6' },
        }),
      ),
    })

    const value = await client.getText('https://example.test/file', {
      onDownloadProgress: (event) => progress.push(event),
    })
    expect(value).toBe('abcdef')
    expect(progress.at(-1)).toEqual({ loaded: 6, total: 6, progress: 1 })
  })

  it.runIf(supportsStreamingRequest())(
    '用 multipart ReadableStream 上传文件并报告生产进度',
    async () => {
      const progress: TransferProgress[] = []
      let requestBody = ''
      const client = new FetchApi({
        fetch: vi.fn(async (input: RequestInfo | URL) => {
          requestBody = await (input as Request).text()
          return jsonResponse({ ok: true })
        }),
      })

      await client.uploadFile(
        'https://example.test/upload',
        new Blob(['file-content'], { type: 'text/plain' }),
        {
          fileName: 'sample.txt',
          fields: { category: 'docs' },
          onUploadProgress: (event) => progress.push(event),
        },
      )

      expect(requestBody).toContain('name="category"')
      expect(requestBody).toContain('name="file"; filename="sample.txt"')
      expect(requestBody).toContain('file-content')
      expect(progress.at(-1)?.loaded).toBe(progress.at(-1)?.total)
      expect(progress.at(-1)?.progress).toBe(1)
    },
  )

  it('OAuth Bearer 并发 401 只刷新一次并各重试一次', async () => {
    let token = 'old'
    let refreshCount = 0
    const auth = new OAuthBearerAuthProvider({
      getAccessToken: () => token,
      refreshAccessToken: async () => {
        refreshCount += 1
        await new Promise((resolve) => setTimeout(resolve, 10))
        token = 'new'
        return true
      },
    })
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const authorization = (input as Request).headers.get('authorization')
      return authorization === 'Bearer new'
        ? jsonResponse({ ok: true })
        : jsonResponse({ title: 'Unauthorized' }, 401)
    })
    const client = new FetchApi({ auth, fetch: fetchMock })

    await expect(
      Promise.all([
        client.getJson('https://example.test/a'),
        client.getJson('https://example.test/b'),
      ]),
    ).resolves.toEqual([{ ok: true }, { ok: true }])
    expect(refreshCount).toBe(1)
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('支持 Basic 和 header/query API Key provider', async () => {
    const requests: Request[] = []
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      requests.push(input as Request)
      return jsonResponse({ ok: true })
    })
    const basic = new FetchApi({
      auth: new BasicAuthProvider('用户', 'secret'),
      fetch: fetchMock,
    })
    await basic.get('https://example.test/basic')

    const headerKey = new FetchApi({
      auth: new ApiKeyAuthProvider('X-API-Key', () => 'header-key'),
      fetch: fetchMock,
    })
    await headerKey.get('https://example.test/header')

    const queryKey = new FetchApi({
      auth: new ApiKeyAuthProvider('api_key', () => 'query-key', 'query'),
      fetch: fetchMock,
    })
    await queryKey.get('https://example.test/query')

    expect(requests[0].headers.get('authorization')).toMatch(/^Basic /)
    expect(requests[1].headers.get('x-api-key')).toBe('header-key')
    expect(new URL(requests[2].url).searchParams.get('api_key')).toBe(
      'query-key',
    )
  })
})
