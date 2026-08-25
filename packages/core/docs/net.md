# 网络客户端（@mmda/core）

面向业务与框架开发者。`net` 不是 axios 封装，而是三层：**Fetch 传输** → **实体 REST** → **OAuth**。错误一律收成 `ApiError`。

组件里不要自己 `new FetchClient()`。应用启动时建一份，放进 DI，页面只 `inject`。

---

## 1. 最小例子

```ts
import {
  FetchClient,
  OAuthApiClient,
  ApiError,
  createDependencyContainer,
  createInjectionToken,
} from '@mmda/core'

export const ApiToken = createInjectionToken<OAuthApiClient>('Api')

export async function bootstrapApi() {
  const http = new FetchClient('https://api.example.com/')
  const api = new OAuthApiClient(http, { service: 'wms' })

  http.useBeforeRequest((ctx) => {
    ctx.options.headers = http.mergeHeaders(ctx.options.headers, {
      'Accept-Language': 'zh-CN',
    })
  })

  const user = await api.authenticate(username, password, clientId, clientSecret)
  api.setUnauthorizedErrorHandler(() => {
    location.assign('/login')
  })

  const di = createDependencyContainer()
  di.provide(ApiToken, api)
  return { di, user }
}

const warehouses = di.inject(ApiToken).repository('Warehouses')
const one = await warehouses.getOne(id)
```

约定：

- **一个应用一份** `FetchClient` + `OAuthApiClient`，共享同一条拦截器和 token
- 业务仓储用 `api.repository('Warehouses')`，不要再 `new` 一套 HTTP
- `clientId` / `clientSecret` 来自配置，**不要**写进源码默认值
- 失败用 `instanceof ApiError`，不要再判断「是不是带 `status` 的 plain object」

---

## 2. 分层：该调哪一层

| 层 | 类型 | 干什么 | 谁用 |
|---|---|---|---|
| 传输 | `HttpClient` / `FetchClient` | verb、JSON、FormData、401 重试 | 框架、极少直接打自定义 URL |
| 实体 REST | `ApiClient` | `service/repository/path/action`、CRUD、MetaUi | Logic、MetaUiService |
| 认证 | `OAuthApiClient` | 登录、refresh、`Authorization` | 应用启动 |
| 错误 | `ApiError` | 统一拒绝值 | 所有 `catch` |

```
OAuthApiClient  →  ApiClient  →  FetchClient  →  fetch
                       ↓
                   ApiError
```

业务代码优先 `ApiClient`（`getOne` / `saveOne` / `doAction`）。只有后端路径对不上实体约定时，才用 `api.http.getJson(url)`。

---

## 3. FetchClient：传输

```ts
const http = new FetchClient(
  baseUrl,           // 相对路径会拼在后面
  undefined,         // 可选：初始 beforeRequest
  true,              // includeCredentials，默认带 cookie
)
```

相对 URL：`getJson('wms/Warehouses/1')` → `{baseUrl}/wms/Warehouses/1`。已经是 `https://...` 或 `//...` 的当绝对地址，不再拼 `baseUrl`。

### JSON

| 方法 | 用途 |
|---|---|
| `getJson` / `postJson` / `putJson` / `patchJson` / `deleteJson` | JSON 头 + `jsonExtractor` |
| `postBlob` | JSON 请求体，响应当 `Blob`（导出、下模板） |

HTTP 非 2xx、或 HTTP 200 但 body 是业务错误（`status >= 400` 且有 `code` / `error` / `message` / `detail`），都会 **reject `ApiError`**。

`get` / `post` 等原始 verb **没有**默认 JSON 解包，要自己传 `resExtractor`。日常用 `*Json`。

### 拦截器：追加，不覆盖

认证、locale、租户各挂各的。用 `useBeforeRequest`，**不要**赋值 `beforeRequest`（赋值现在也是追加，已弃用）。

```ts
http.useBeforeRequest((ctx) => {
  ctx.options.headers = http.mergeHeaders(ctx.options.headers, {
    'X-Locale': locale,
  })
})
```

改 Header 必须走 `mergeHeaders`。直接 `headers = { Authorization: ... }` 会丢掉已有的 `Content-Type`。

单次请求的额外头用 `beforeSend`，只作用于这一次：

```ts
http.getJson('/ping', {
  beforeSend: (ctx) => {
    ctx.options.headers = http.mergeHeaders(ctx.options.headers, {
      'X-Debug': '1',
    })
  },
})
```

刷新 token 的请求自己要设 `ctx.skipAuthRefresh = true`，否则 401 会再 refresh，形成死循环。`OAuthApiClient` 的登录和 refresh 已经设了。

---

## 4. ApiClient：实体 REST

```ts
const api = new OAuthApiClient(http, {
  service: 'wms',           // 默认服务名
  repository: 'Warehouses', // 可省略，之后用 repository()
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
| `searchAll(body)` | `GET` + body | 带搜索条件的列表 |
| `createOne(data)` | `.../create` | |
| `saveOne(entity)` | `.../save` | 会去掉 `rowNum`、`actions` |
| `saveAll(list)` | `.../saveAll` | |
| `deleteOne(id)` | `DELETE` | |
| `deleteOneByPost(id)` | `.../delete` | 后端不支持 DELETE 时 |
| `deleteAll(ids)` | `.../deleteAll` | |
| `doAction({ action, path }, body)` | `POST .../{action}` | 自定义动作 |
| `getMetaUi` / `getMetaUiPack` | `.../metaui`、`.../metaUiPack` | 给 MetaUiService 用 |

换服务或仓储，把参数传进方法，不必新开客户端：

```ts
await api.getOne(id, { service: 'mes', repository: 'Orders' })
await api.doAction({ action: 'confirm', path: id }, { remark })
```

`getAll` / `searchAll` 返回 `PagedList`：`{ list, pagination }`。分页来自响应头 `x-pager`（常量 `PAGINATION_HEADER`），没有该头则是 `NO_PAGINATION`。

---

## 5. OAuth

```ts
const api = new OAuthApiClient(http, { service: 'wms' })

const user = await api.authenticate(
  username,
  password,
  clientId,
  clientSecret,
  redirectUris, // 可选
)
```

- 打 `auth/authorize`，`grant_type=password`
- 写入 `config.accessToken` / `refreshToken` / `expiresIn`（**毫秒时间戳**，`Date.now()` 口径）
- 自动 `setAuthenticator()`：之后每次请求追加 `Authorization: Bearer ...`
- 返回 `OAuthUser`（`expiryOn` 同样是毫秒时间戳）

`clientId`、`clientSecret` 为空会直接 reject，不会用占位符去换 token。

### 401 刷新

`setAuthenticator` 同时设置 `http.refreshHandler`。业务请求 401 时：

1. 用 `refresh_token` 再打 `auth/authorize`（`skipAuthRefresh`）
2. **并发 401 共用这一次** refresh
3. 成功则带新 token 重试原请求一次
4. 仍失败 → `unauthorizedErrorHandler`，再以 `ApiError` reject

没有 `refreshToken`、或 refresh 失败：不重试，走未授权回调。

手动刷新：`await api.refreshToken()` → `boolean`。一般不用自己调。

刷新失败要跳登录时：

```ts
api.setUnauthorizedErrorHandler((_err, _req) => {
  location.assign('/login')
})
```

不要在这个回调里再发会 401 的业务请求。

---

## 6. 错误：一律 ApiError

`ApiError` 继承 `Error`，字段：`code`、`error`、`message`、`cause`、`status`、`validationErrors`、`request`。

```ts
import { ApiError, isApiError, toApiError } from '@mmda/core'

try {
  await api.saveOne(row)
} catch (e) {
  if (e instanceof ApiError) {
    if (e.status === 401) return
    toast(e.message)
    e.validationErrors?.forEach((v) => markField(v.field, v.error))
    return
  }
  throw e
}
```

| 工具 | 用途 |
|---|---|
| `instanceof ApiError` / `isApiError` | 已经过 HTTP 层的失败 |
| `isApiErrorPayload` | 还没进客户端的裸 JSON（例如本地组装的结果） |
| `toApiError(x)` | 收成 `ApiError`；对实例幂等 |

不要写：

```ts
if (e instanceof ApiError || isApiErrorPayload(e)) {
  throw e instanceof ApiError ? e : toApiError(e)
}
```

走 `FetchClient` / `ApiClient` 的请求，`catch` 里已经是 `ApiError`。

`ApiClient` 构造时会把 `http.errorHandler` 绑成 `handleApiError`（内部 `throw toApiError`）。不要再覆盖成会丢掉 `this` 的 `this.handleApiError` 裸引用。

---

## 7. 文件

通用上传还在 `ApiClient` 上：

```ts
await api.uploadFile(file, { service: 'files' }, 'file')
await api.uploadFiles(files, { repository: 'Orders', action: 'importFile' }, 'file')
await api.importExcel(file, 'file', { repository: 'Orders' }, checkExists, ignoreError)
```

`service === 'files'` 且未指定 `action` 时，上传不再拼 `importFile`，路径就是 `files/{repository}`。

导出仍走 `exportOne` / `exportAll`，内部是 `http.downloadFile`：**会在浏览器里建 `<a>` 触发下载**。非 DOM 环境（Node、Worker）不要用。只要 blob、自己处理下载：

```ts
const blob = await api.http.postBlob(
  api.buildEntityURL({ action: 'export', path: id }),
  {},
)
```

附件、报表模板的**形状**在 `models/file.ts`（`Attachment` / `ReportTemplate`）。
它们不是 HTTP 客户端的一部分：不要从 `ApiClient` 找 `uploadAttachment` / `uploadTemplate`。
会话层（vui `UiBuildContext`）用通用方法：

```ts
await api.doAction(
  { action: 'uploadAttachment', service: 'files', path: id },
  attachment,
)

const blob = await api.http.postBlob(
  api.buildEntityURL({
    action: 'downloadTemplate',
    repository,
    queryParams: { templateID },
  }),
  {},
)
```

---

## 8. 和 DI 怎么配合

```ts
const ApiToken = createInjectionToken<OAuthApiClient>('Api')

di.provide(ApiToken, api) // 单例，跟应用走

class WarehouseLogic {
  constructor(private readonly api = di.inject(ApiToken).repository('Warehouses')) {}
}
```

| | net | DI |
|---|---|---|
| 放什么 | HTTP、token、CRUD | 把 `OAuthApiClient` 登记成服务 |
| 几份 | 每应用一份 http | 同一 token 一份 api |
| 页面状态 | 不放 | 不放（那是 Vue provide） |

不要每个 Logic `new FetchClient()`。拦截器和 token 会分叉，刷新也会各刷各的。

---

## 9. 测试

用 `vi.stubGlobal('fetch', ...)` 假请求，不要打真后端。每个用例自己 `new FetchClient`。

```ts
import { FetchClient, OAuthApiClient, ApiError } from '@mmda/core'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

it('401 只 refresh 一次', async () => {
  let refresh = 0
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input instanceof Request ? input.url : input)
    if (url.includes('auth/authorize')) {
      refresh++
      return json({ access_token: 'n', refresh_token: 'r', expires_in: 60 })
    }
    return json({ message: 'no' }, 401)
  }))

  const http = new FetchClient('http://example.test')
  const api = new OAuthApiClient(http, {
    service: 'api',
    accessToken: 'old',
    refreshToken: 'r',
  })
  api.setAuthenticator()
  await expect(api.getOne('1', { repository: 'items' })).rejects.toBeInstanceOf(ApiError)
  expect(refresh).toBe(1)
})
```

测拦截器时断言 `Request.headers`，不要假定 `init` 一定有值：`FetchClient` 传入的是已经建好的 `Request`。

---

## 10. 常见错误

1. **`http.beforeRequest = fn` 当「替换」** — 只会追加。用 `useBeforeRequest`。
2. **拦截器里覆盖整个 `headers` 对象** — 认证会吃掉 JSON Content-Type。用 `mergeHeaders`。
3. **默认 `client_secret: '123'`** — 已删除。缺凭证会 reject。
4. **把 refresh token 打到 `console`** — 不要。
5. **登录 / refresh 请求不设 `skipAuthRefresh`** — 401 会死循环。走 `authenticate` / `refreshToken` 则已处理。
6. **`catch` 里当 plain object 读 `e.status`** — 现在是 `ApiError`。
7. **每个页面 `new FetchClient()`** — token 和 401 单飞都失效。
8. **用 `new Date().plus({ seconds })` 算过期** — `expiryOn` / `expiresIn` 都是 `Date.now() + expires_in * 1000`。
9. **从 `ApiClient` 调 `uploadAttachment`** — 已移除。类型从 `@mmda/core` 的 `Attachment` 导入，传输用 `doAction` / `postBlob`（vui 已包在 `UiBuildContext`）。
10. **Node 里调 `downloadFile` / `exportAll`** — 内部用 `document`。改 `postBlob`。

---

## 11. 从旧 API 迁移

| 旧写法 | 新写法 |
|---|---|
| `http.beforeRequest = fn`（覆盖） | `http.useBeforeRequest(fn)` |
| `clientSecret \|\| '123'` | 必填，否则 `authenticate` reject |
| `refreshToken()` 空实现 | 真实 `grant_type=refresh_token`，401 自动单飞 |
| `expirsIn` | `expiresIn`（毫秒时间戳） |
| `expiryOn: new Date(now).plus(...)` | `Date.now() + expires_in * 1000` |
| `errorHandler = this.handleApiError` | 构造里已绑定；不要再赋未 bind 的方法 |
| 401 body 没有 `status` | `FetchClient` 会补 HTTP status，再收成 `ApiError` |
| `isApiErrorPayload` + `toApiError` 双判断 | `instanceof ApiError` |
| `Attachment` / `ReportTemplate` | `@mmda/core` 的 `models/file` |
| `uploadAttachment` / `uploadTemplate` / `downloadTemplate` | vui `UiBuildContext` 调 `doAction` / `http.postBlob` |
| `OAuthApiClient` 与 `ApiClient` 同一文件 | 仍从 `@mmda/core` 导入，实现在 `oauth_api_client.ts` |

应用侧骨架：

```ts
const http = new FetchClient(config.baseUrl)
const api = new OAuthApiClient(http, { service: config.service })
await api.authenticate(...)
this.di.provide(ApiToken, api)
```
