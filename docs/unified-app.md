# 统一应用壳架构

## 背景

BASE 与 MES 原来各自创建 Vue 根、Router 和 `MmdaApplication`。即使通过同域网关共享登录态，跨系统导航仍需重新加载整套 SPA，并产生重复的 AppShell、登录、页脚、文件预览和 EntityView。

现在统一为：

- 一个 `@mmda/app` 前端产物
- 一个 Vue 根和一个 Vue Router
- 一个 `MmdaApplication`（登录、用户、主题、overlay、模块权限树）
- BASE/MES 作为业务插件注册路由、API service、Logic 和自定义页面

## 包职责

### `@mmda/app`

应用宿主和唯一部署入口，负责：

- `AppShell`、`AppLogo`、`AppUserFooter`
- 登录、修改密码、无权限页、Office/FileView
- 通用 `EntityView`
- `AppPluginRegistry`
- 单 Router、统一守卫、单次会话恢复
- 组装 BASE/MES 插件

### `@mmda/base`

只提供 BASE 业务：

- BASE Home
- BASE Logic loaders
- BASE placeholder 页面
- BASE 模型、枚举和业务模块
- `basePlugin`

### `@mmda/mes`

只提供 MES 业务：

- MES Home
- MES Logic loaders
- MES placeholder 页面
- 甘特、BPMN 等自定义视图
- `mesPlugin`

## 插件解析

插件至少提供：

```ts
{
  name: 'mes',
  service: 'mes',
  routePrefix: '/MES',
  home,
  logicLoaders,
  resolveCustomView,
}
```

通用 EntityView 根据当前 URL 找到插件：

1. `/BASE/Materials` 解析为 `service=base`
2. `/MES/Processes` 解析为 `service=mes`
3. 元数据调用显式传 `service`
4. Logic token 使用 `${service}:${repository}Logic`，避免同名仓库冲突
5. MES 排程等页面通过 `resolveCustomView` 覆盖通用列表

`UI_APP_KEY` 始终指向同一个宿主，不再随路由切换，也不会重复安装 overlay。

## 登录与权限

- 登录、注销挂在根路径：`/Signin`、`/Signout`（`/BASE/Signin` 会跳转到 `/Signin`）。
- OAuth 登录固定由 BASE 身份客户端完成。
- 登录后只获取一次完整 `ModuleAuths?asTree=1`。
- AppSideMenu 使用完整权限树，同时处理 `/BASE/*`、`/MES/*`。
- Router guard 从 URL 解析插件，再检查目标模块的 `allowRead`。
- BASE/MES 之间使用 `RouterLink`，不再整页刷新。

## 开发与部署

开发（仅此入口，不再单独跑 BASE/MES Vite）：

```bash
pnpm dev:app
```

- 统一 SPA：`http://127.0.0.1:5174/`
- `/BASE/*`、`/MES/*`、`/Signin`、`/Signout` 都是同一 Vue Router
- `/api/*` 由 Vite `server.proxy` 转到 `127.0.0.1:8001`
- 不再需要开发期 Node 网关（`5100`）

生产：

```bash
pnpm --filter @mmda/app build
```

只部署 `packages/app/dist`。Nginx 对 `/BASE/*` 和 `/MES/*` 使用同一个 `index.html` fallback。

## 依赖约束

依赖方向为：

```text
@mmda/app -> @mmda/base
@mmda/app -> @mmda/mes
@mmda/mes -> @mmda/base（仅领域模型/枚举）
```

BASE/MES 插件不得导入 `@mmda/app`，否则会形成宿主与插件循环依赖。
