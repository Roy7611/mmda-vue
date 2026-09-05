# 网络客户端（@mmda/core）

面向业务与框架开发者。`net` 不是 axios 封装。当前推荐栈是 **FetchApi 传输** → **ApiClient 实体 REST** → **OAuth2ApiClient 认证**。HTTP 与业务错误走 RFC 9457 **`ApiProblem`**。

**Deprecated：** `FetchClient`、`OAuthApiClient`、`ApiError` 本轮保留行为，不要在新代码使用。推荐 `FetchApi` + `OAuth2ApiClient` + `ApiProblem`。单文件说明见 [net/](./net/http.md)。

组件里不要自己 `new FetchApi()` / `new OAuth2ApiClient()`。应用启动时建一份（vui 的 `MmdaApplication` 已建），放进 DI，页面只 `inject`。

---

## 本次重构

相对旧的 `FetchClient` + `OAuthApiClient` + `ApiError`，这次把传输、错误、认证拆开，并接到应用壳。

| 点 | 旧 | 新 |
|---|---|---|
| 传输 | `FetchClient` 继承 `HttpClient`，4xx 仍先拿到 `Response` 再在适配层转错误 | **`FetchApi`**：独立类，不继承 `HttpClient`；标准 Fetch / Streams / Abort；浏览器、Worker、Node |
| 错误 | 一律 `ApiError`（`code` / `error` / `message` / `cause`） | **`ApiProblem`**（RFC 9457：`type` `title` `status` `detail` `instance`）。固定扩展只有 **`validationErrors`**。`cause` 不是 Problem 成员，只作 JS `Error.cause` |
| 认证 | `HttpClient` 拦截器追加 Bearer；`refreshHandler` 处理 401 | 可插拔 **`FetchAuthProvider`**。内置 Bearer / Basic / API Key。OAuth 换票仍在应用层 |
| 接到 CRUD | `OAuthApiClient(http: HttpClient)` | **`OAuth2ApiClient(fetchApi)`** 内部用 `FetchApiHttp(applyFetchAuth)`；Bearer 与 401 单飞刷新走 `OAuthBearerAuthProvider` |
| 应用壳 | `MmdaApplication` → `FetchClient` + `OAuthApiClient` | **`FetchApi` + `OAuth2ApiClient`**（`packages/vui`） |
| 仍保留 | — | `FetchClient` / `OAuthApiClient` / `ApiError` **deprecated，不删** |

源码：

| 文件 | 职责 |
|---|---|
| `net/fetch_api.ts` | `FetchApi`、`FetchAuthProvider`、`OAuthBearerAuthProvider` / `BasicAuthProvider` / `ApiKeyAuthProvider` |
| `net/api_problem.ts` | `ApiProblem`、`responseToApiProblem`、`toApiProblem` |
| `net/fetch_api_http.ts` | `FetchApiHttp`：把 `FetchApi` 接到旧 `HttpClient` |
| `net/oauth_api_client.ts` | `OAuthApiClient`（旧）+ `OAuth2ApiClient`（新） |
| `net/http.ts` / `api_error.ts` / `api_client.ts` | 旧传输、旧错误、实体 REST（CRUD 未换契约） |

测试：`fetch_api.test.ts`、`fetch_api_http.test.ts`、`oauth2_api_client.test.ts`。旧 `http.test.ts` 仍覆盖 `FetchClient` / `OAuthApiClient`。

---

## 1. 最小例子（推荐）

```ts
import {
  FetchApi,
  OAuth2ApiClient,
  ApiProblem,
  createDependencyContainer,
  createInjectionToken,
} from '@mmda/core'

export const ApiToken = createInjectionToken<OAuth2ApiClient>('Api')

const fetchApi = new FetchApi({
  baseUrl: 'https://api.example.com/',
  credentials: 'include',
})
const api = new OAuth2ApiClient(fetchApi, { service: 'wms' })

const user = await api.authenticate(username, password, clientId, clientSecret)
api.setUnauthorizedErrorHandler(() => {
  location.assign('/login')
})

const di = createDependencyContainer()
di.provide(ApiToken, api)

const warehouses = di.inject(ApiToken).repository('Warehouses')
const one = await warehouses.getOne(id)
```

vui 应用不必手写上面这段：`new MmdaApplication(apiUrl, 'base', builder, i18n, { clientId, clientSecret })` 已经 `new OAuth2ApiClient(new FetchApi({ baseUrl, credentials: 'include' }))`。相对路径 `baseUrl`（如 `/api`）会相对 `location.origin` 解析。

约定：

- **一个应用一份** `FetchApi` + `OAuth2ApiClient`，共享 token 与 401 刷新
- 业务仓储用 `api.repository('Warehouses')`，不要再 `new` 一套 HTTP
- `clientId` / `clientSecret` 来自配置，**不要**写进源码默认值
- 新路径失败用 `instanceof ApiProblem`（`detail` / `title` / `status` / `validationErrors`）

只打自定义 URL、不走实体 CRUD 时，可以直接 `new FetchApi({ auth })`。

---

## 2. 分层：该调哪一层

| 层 | 类型 | 干什么 | 谁用 |
|---|---|---|---|
| 传输 | `FetchApi` | verb、JSON、FormData/流、进度、Abort、可插拔 auth | 框架、极少直接打自定义 URL |
| 适配 | `FetchApiHttp` | 把 `FetchApi` 接到 `HttpClient`，供 `ApiClient` 使用 | `OAuth2ApiClient` / 过渡期 `OAuthApiClient` |
| 实体 REST | `ApiClient` | `service/repository/path/action`、CRUD、MetaUi | Logic、MetaUiService |
| 认证 | `OAuth2ApiClient` | password grant、refresh、Bearer、401 单飞 | 应用启动 |
| 错误 | `ApiProblem` | RFC 9457；取消/超时仍是原生 `AbortError` / `TimeoutError` | 新路径所有 `catch` |

```
OAuth2ApiClient  →  ApiClient  →  FetchApiHttp  →  FetchApi.request  →  fetch
                       ↓                              ↓
                   ApiClient CRUD              OAuthBearerAuthProvider
                       ↓
                   ApiProblem
```

业务代码优先 `ApiClient`（`getOne` / `saveOne` / `doAction`）。只有后端路径对不上实体约定时，才用 `api.http.getJson(url)` 或 `api.fetchApi.getJson(url)`。

不要叠两条认证：`OAuth2ApiClient` 会占用 `fetchApi.auth`。不要再对同一份 `FetchApi` 调 `OAuthApiClient.setAuthenticator`，也不要预先挂别的 provider。

---

## 3. FetchApi：传输

不继承 `HttpClient`，不依赖 `window` / `document`。

```ts
const http = new FetchApi({
  baseUrl: 'https://api.example.com/',
  credentials: 'include', // 默认 same-origin
  headers: { Accept: 'application/json' },
  auth: undefined, // 或 FetchAuthProvider；OAuth2ApiClient 会自己装
  fetch: globalThis.fetch, // 测试可注入
})
```

相对 URL 用 `new URL(input, baseUrl)` 解析。

### 原始响应与数据类型

- `get` / `head` / `post` / `put` / `patch` / `delete` / `options` 返回 `Promise<Response>`（仅 `ok`）
- `getJson` / `postJson` / `putJson` / `patchJson` 负责 JSON 编解码
- `getText` / `getBlob` / `getArrayBuffer` / `getStream` 显式选择响应类型
- 原始请求的 `body` 接受标准 `BodyInit`（string、Blob、FormData、ReadableStream）

每个请求都可传 `signal` 和 `timeout`。取消与超时保留 Fetch 标准 rejection：`AbortError` / `TimeoutError`，不包装成 `ApiProblem`。

`raw(input, init)` 是原生 fetch：不拼 baseUrl、不注入认证、4xx 仍 resolve 出 `Response`。给 `FetchApiHttp` 的旧适配路径用。

### 文件与进度

无进度上传用标准 FormData，所有 Fetch 运行时都能用：

```ts
await http.uploadFile('files', file, {
  fieldName: 'file',
  fields: { category: 'document' },
})
```

传入 `onUploadProgress` 时改为自建 multipart `ReadableStream` + `duplex: 'half'`。回调表示「已生产并交给 Fetch 的字节」，不是服务端已接收。Chromium / Node(undici) 可用；不支持流式请求的运行时会抛 `TypeError`，不伪造 0/100。

下载进度来自消费 `Response.body`：

```ts
const { blob, fileName } = await http.downloadFile('files/report', {
  onDownloadProgress: ({ loaded, total, progress }) => {
    console.log(loaded, total, progress)
  },
})
```

核心层只返回 Blob 与 `Content-Disposition` 文件名，**不**用 `document` 自动保存。`ApiClient.exportOne` / `exportAll` 仍走 `HttpClient.downloadFile`（会建 `<a>`）；Node / Worker 请改 `fetchApi.downloadFile` 或 `http.postBlob`。

自定义 `ReadableStream` 请求体若可能 401 重试，必须提供 `bodyFactory`（流不能重放）。

---

## 4. ApiProblem（RFC 9457）

非 2xx 抛出 `ApiProblem`。优先解析 `application/problem+json`。HTTP 状态以**响应状态行**为准，不以 JSON 里的 `status` 覆盖。

非 Problem JSON / 文本错误会收成 `type: 'about:blank'`，`title`/`detail` 尽量从旧业务字段映射：

| 来源 | Problem 成员 |
|---|---|
| `ApiError.error` 或默认短文案 | `title` |
| `ApiError.message` | `detail` |
| `ApiError.validationErrors` | **固定扩展** `validationErrors` |
| `ApiError.code`（URI 形态） | `type` |
| `ApiError.code`（普通码） | `extensions.code` |
| `ApiError.cause` | 只进 `Error.cause`，**不**进 `toJSON()` |

其余未知 JSON 键进 `extensions`。`cause` 不是 Problem Details 成员，不要当 `title` 的别名。

```ts
try {
  await api.getOne('missing')
} catch (error) {
  if (error instanceof ApiProblem) {
    console.error(error.status, error.type, error.detail)
    error.validationErrors?.forEach((v) => markField(v.field, v.error))
  }
  // AbortError / TimeoutError 原样上抛
}
```

`toApiProblem(x)` 把 `ApiError` / 已是 Problem 的值收成 `ApiProblem`（对实例幂等）。`ApiClient.handleApiError`：已是 `ApiProblem` 则再抛，否则旧路径仍 `toApiError`。

网络失败（DNS、断连）不是服务端 Problem，保持原生 TypeError / fetch rejection。

---

## 5. 认证提供器

`FetchAuthProvider`：`authorize(ctx)` 在每次发出前调用；可选 `refresh(problem, ctx)` 在 401 后返回是否允许重试一次。并发刷新由 provider 自己单飞。

| 类 | 行为 |
|---|---|
| `OAuthBearerAuthProvider` | `Authorization: Bearer`；`refreshAccessToken` 并发合并；刷新期间 token 已被别的请求更新则直接重试 |
| `BasicAuthProvider` | UTF-8 Base64 `Authorization: Basic` |
| `ApiKeyAuthProvider` | 请求头或 query |

单次请求 `auth: false` 跳过全局认证（登录 / refresh 必须如此）。`OAuth2ApiClient` 把 `HttpClient` 的 `skipAuthRefresh` 映射成 `auth: false`。

token endpoint **不在** `FetchApi` 里。password grant / refresh_token 由 `OAuth2ApiClient.authenticate` / `refreshToken` 打 `auth/authorize`。

```ts
const auth = new OAuthBearerAuthProvider({
  getAccessToken: () => accessToken,
  refreshAccessToken: async () => {
    // 换票并更新 accessToken
    return true
  },
})
const http = new FetchApi({ baseUrl, auth })
```

应用走 `OAuth2ApiClient` 时不要自己再 `new OAuthBearerAuthProvider` 挂上去。

---

## 6. OAuth2ApiClient

```ts
const fetchApi = new FetchApi({
  baseUrl: 'https://api.example.com/',
  credentials: 'include',
})
const api = new OAuth2ApiClient(fetchApi, { service: 'wms' })

const user = await api.authenticate(
  username,
  password,
  clientId,
  clientSecret,
  redirectUris, // 可选
)
```

- 构造时拒绝「已经有 `fetchApi.auth`」的实例
- 装上 `OAuthBearerAuthProvider`：`getAccessToken` 读 `config.accessToken`，401 调 `refreshToken()`
- 登录 / refresh 走 `skipAuthRefresh` → `auth: false`
- 打 `auth/authorize`，`grant_type=password` 或 `refresh_token`
- 写入 `config.accessToken` / `refreshToken` / `expiresIn`（**毫秒时间戳**，`Date.now()` 口径）
- 返回 `OAuthUser`（`expiryOn` 同样是毫秒时间戳）
- **没有** `setAuthenticator`：Bearer 从构造起就由 FetchApi 注入

`clientId`、`clientSecret` 为空会直接 reject。

### 401 刷新

1. `FetchApi` 收到 401，调 provider.refresh
2. `refresh_token` 再打 `auth/authorize`（无 Bearer）
3. **并发 401 共用这一次** refresh
4. 成功则用新 token 重试原请求一次
5. 仍失败 → `unauthorizedErrorHandler`，再以 `ApiProblem` reject

没有 `refreshToken`、或 refresh 失败：不重试，走未授权回调。手动：`await api.refreshToken()` → `boolean`。

```ts
api.setUnauthorizedErrorHandler((_err, _req) => {
  location.assign('/login')
})
```

不要在这个回调里再发会 401 的业务请求。

### FetchApiHttp

`ApiClient` 仍吃 `HttpClient`。`OAuth2ApiClient` 使用 `new FetchApiHttp(fetchApi, …, applyFetchAuth: true)`：

- 把已构造的 `Request` 收成可重放 body（Blob），再 `fetchApi.request`（含认证与 401 重试）
- 登录 / refresh 的 `skipAuthRefresh` → `auth: false`
- **不再**走 `HttpClient.refreshHandler`（避免双重刷新）

过渡：只换传输、认证仍用旧拦截器时：

```ts
const fetchApi = new FetchApi({ baseUrl, credentials: 'include' }) // 不要挂 auth
const http = new FetchApiHttp(fetchApi) // applyFetchAuth 默认 false → raw()
const api = new OAuthApiClient(http, { service: 'wms' })
api.setAuthenticator()
```

这条适配路径的 HTTP / 200 业务错误体也是 **`ApiProblem`**。旧 `new FetchClient()` 仍抛 **`ApiError`**。

---

## 7. ApiClient：实体 REST

```ts
const api = new OAuth2ApiClient(fetchApi, {
  service: 'wms',
  repository: 'Warehouses',
})

const wh = api.repository('Warehouses') // 共用同一个 http / token
```

URL 形状：

```
{service}/{repository}/{path}/{action}?query
```

缺省用 `config.service` / `config.repository`。`path` 一般是实体 id。

| 方法 | 后端动作 | 说明 |
|---|---|---|
| `getOne(id)` | `GET .../{id}` | 单条 |
| `getAll({ queryParams })` | `GET ...` | 分页列表，读响应头 `x-pager` |
| `searchAll(param)` | GET `getAll` 或 POST `.../searchAll` | 吃 `EntitySearchParam`；有 `filterModel` 才 POST（见 [entity_search.md](./models/entity_search.md)） |
| `createOne(data)` | `.../create` | |
| `saveOne(entity)` | `.../save` | 会去掉 `rowNum`、`actions` |
| `saveAll(list)` | `.../saveAll` | |
| `deleteOne(id)` | `DELETE` | |
| `deleteOneByPost(id)` | `.../delete` | 后端不支持 DELETE 时 |
| `deleteAll(ids)` | `.../deleteAll` | |
| `doAction({ action, path }, body)` | `POST .../{action}` | 自定义动作 |

`metaui` / `metaUiPack` 由 `MetaUiService` 用 `buildEntityURL` + `http.getJson` 拉取 JSON，再 `new MetaUi`。`ApiClient` 不解析元数据。

换服务或仓储，把参数传进方法，不必新开客户端：

```ts
await api.getOne(id, { service: 'mes', repository: 'Orders' })
await api.doAction({ action: 'confirm', path: id }, { remark })
```

`searchAll(param)` 把 `EntitySearchParam` 拆成传输：分页 / `searchWord` / `queryParams` 进 URL（`toQueryParams`）；有 `filterModel` 时 POST `.../searchAll`，body 为 FilterModel 映射（`toSearchRequest`）。无过滤则 GET `getAll`。字段条件不要再塞进 `queryParams`。详见 [api_client.md](./net/api_client.md)、[entity_query_usage.md](./logic/entity_query_usage.md)。

`getAll` / `searchAll` 返回 `PagedList`：`{ list, pagination }`。分页来自响应头 `x-pager`（常量 `PAGINATION_HEADER`），没有该头则是 `NO_PAGINATION`。

`HttpClient` 拦截器（locale 等）仍可用 `api.http.useBeforeRequest`。改 Header 必须走 `mergeHeaders`，不要整对象覆盖。

---

## 8. 文件

通用上传还在 `ApiClient` 上：

```ts
await api.uploadFile(file, { service: 'files' }, 'file')
await api.uploadFiles(files, { repository: 'Orders', action: 'importFile' }, 'file')
await api.importExcel(file, 'file', { repository: 'Orders' }, checkExists, ignoreError)
```

`service === 'files'` 且未指定 `action` 时，上传不再拼 `importFile`，路径就是 `files/{repository}`。

导出：`exportOne` / `exportAll` 内部是 `HttpClient.downloadFile`（浏览器 `<a>`）。只要 blob：

```ts
const { blob, fileName } = await api.fetchApi.downloadFile(
  api.buildEntityURL({ action: 'export', path: id }),
)
```

或旧 `api.http.postBlob(...)`。

附件、报表模板的形状在 `models/file.ts`。不要从 `ApiClient` 找 `uploadAttachment` / `uploadTemplate`。会话层（vui `UiBuildContext`）用 `doAction` / `postBlob`。

---

## 9. 和 DI / 应用壳

```ts
const ApiToken = createInjectionToken<OAuth2ApiClient>('Api')
di.provide(ApiToken, api)
```

| | net | DI |
|---|---|---|
| 放什么 | HTTP、token、CRUD | 把 `OAuth2ApiClient` 登记成服务 |
| 几份 | 每应用一份 FetchApi | 同一 token 一份 api |
| 页面状态 | 不放 | 不放（那是 Vue provide） |

不要每个 Logic `new FetchApi()`。拦截器和 token 会分叉，刷新也会各刷各的。

---

## 10. 测试

用注入 `fetch` 或 `vi.stubGlobal('fetch', ...)`，不要打真后端。测 `OAuth2ApiClient` 时把 mock 传给 `FetchApi({ fetch })`。

```ts
import { FetchApi, OAuth2ApiClient, ApiProblem } from '@mmda/core'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

it('并发 401 只 refresh 一次', async () => {
  let refresh = 0
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input instanceof Request ? input.url : input)
    if (url.includes('auth/authorize')) {
      refresh++
      return json({ access_token: 'n', refresh_token: 'r', expires_in: 60 })
    }
    return json({ message: 'no' }, 401)
  })

  const api = new OAuth2ApiClient(
    new FetchApi({ baseUrl: 'http://example.test/', fetch: fetchMock }),
    { service: 'api', accessToken: 'old', refreshToken: 'r' },
  )
  await expect(api.getOne('1', { repository: 'items' })).rejects.toBeInstanceOf(
    ApiProblem,
  )
  expect(refresh).toBe(1)
})
```

断言 `Request.headers`，不要假定 `init` 一定有值：适配器传入的经常是已经建好的 `Request`。

---

## 11. 旧栈：FetchClient / OAuthApiClient / ApiError

仍导出、仍可用，用于尚未切换的代码。

```
OAuthApiClient  →  ApiClient  →  FetchClient  →  fetch
                       ↓
                   ApiError
```

```ts
const http = new FetchClient(baseUrl, undefined, true)
const api = new OAuthApiClient(http, { service: 'wms' })
await api.authenticate(...)
api.setAuthenticator() // 拦截器追加 Bearer；refreshHandler 处理 401
```

要点（与新栈对照）：

- HTTP 非 2xx、或 HTTP 200 但 body 是业务错误 → **reject `ApiError`**
- 登录 / refresh 设 `ctx.skipAuthRefresh = true`（`authenticate` / `refreshToken` 已设）
- 拦截器用 `useBeforeRequest` + `mergeHeaders`
- `catch` 用 `instanceof ApiError`；`toApiError` 对实例幂等
- `ApiClient` 构造已绑定 `handleApiError`，不要再赋未 bind 的方法
- `FetchClient.downloadFile` 依赖 `document`

---

## 12. 常见错误

1. **给 `OAuth2ApiClient` 的 `FetchApi` 预先挂 `auth`** — 构造会抛。Bearer 由客户端安装。
2. **`OAuth2ApiClient` 与 `OAuthApiClient.setAuthenticator` 叠用** — 双重 Bearer、双重刷新。
3. **把 `ApiError.cause` 当成 Problem 的 `title`** — `title`←`error`，`detail`←`message`，`cause` 只是 `Error.cause`。
4. **`http.beforeRequest = fn` 当「替换」** — 只会追加。用 `useBeforeRequest`。
5. **拦截器里覆盖整个 `headers` 对象** — 认证会吃掉 JSON Content-Type。用 `mergeHeaders`。
6. **默认 `client_secret: '123'`** — 已删除。缺凭证会 reject。
7. **把 refresh token 打到 `console`** — 不要。
8. **登录 / refresh 不跳过 auth** — 新栈靠 `auth: false` / `skipAuthRefresh`；走 `authenticate` / `refreshToken` 已处理。
9. **新路径 `catch` 里当 `ApiError` 或 plain object 读 `e.status`** — 用 `instanceof ApiProblem`。
10. **每个页面 `new FetchApi()`** — token 和 401 单飞都失效。
11. **用 `new Date().plus({ seconds })` 算过期** — `expiryOn` / `expiresIn` 都是 `Date.now() + expires_in * 1000`。
12. **从 `ApiClient` 调 `uploadAttachment`** — 已移除。类型从 `Attachment` 导入，传输用 `doAction` / `postBlob`。
13. **Node 里调 `HttpClient.downloadFile` / `exportAll`** — 内部用 `document`。改 `fetchApi.downloadFile`。
14. **自备 ReadableStream 且可能 401，却不传 `bodyFactory`** — 流不能重放，重试会失败。

---

## 13. 从旧 API 迁移

| 旧写法 | 新写法 |
|---|---|
| `new FetchClient(url)` + `new OAuthApiClient(http, cfg)` | `new OAuth2ApiClient(new FetchApi({ baseUrl: url, credentials: 'include' }), cfg)` |
| `api.setAuthenticator()` | 删除；`OAuth2ApiClient` 构造已装 provider |
| `instanceof ApiError`（新路径） | `instanceof ApiProblem`；`e.detail` / `e.validationErrors` |
| `e.code` | URI 码在 `e.type`，普通码在 `e.extensions.code` |
| `e.cause` 当协议字段 | 不要；调试看 `Error.cause` |
| `http.beforeRequest = fn` | `http.useBeforeRequest(fn)` |
| `clientSecret \|\| '123'` | 必填，否则 `authenticate` reject |
| `expirsIn` | `expiresIn`（毫秒时间戳） |
| `MmdaApplication` 旧传输 | 已切换；业务包不用改构造参数 |
| `FetchApiHttp` + 自己挂 OAuth provider | 用 `OAuth2ApiClient`，或旧客户端 + `raw()` 二选一 |
| `Attachment` 专用 API | vui `UiBuildContext` 的 `doAction` / `postBlob` |
