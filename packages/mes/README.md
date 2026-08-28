# @mmda/mes

制造执行系统，从旧仓 `D:\vue\mmda-vue\packages\mes` 迁到本仓。通过 `VITE_BASE_API` 访问统一网关 `/api`。

## 启动

1. 复制 `.env.example` 为 `.env`，配置 `VITE_BASE_API` 与 OAuth（默认 clientId 为 `mmda-mes`）。
2. 仓库根目录：`pnpm install`，然后 `pnpm dev:mes`（默认 http://127.0.0.1:5176/）。
3. 打开 `/MES/Signin` 登录。

## 移植边界

- 标准 CRUD 走元数据路由 `/MES/:repository`、`/Create`、`/Edit/:id`、`/:id`，交互逻辑在 `src/modules/**/*Logic.ts`。
- 编译期可引用 `@mmda/base/src/...`（枚举与跨服务模型类型），不引用 `@mmda/iot` / `@mmda/srm`（仅 `src/compat` 桩）。
- 旧 `HeaderView` / 逐仓库 ListView·Editor 未迁入；壳是 `MmdaPrimeApp`。
- 生产/质量看板、甘特、工位门户源码在 `src/components`，路由上仍为占位页，后续再接到新 `UiBuildContext`。

## 分层约束

- toast 走 `context.uiBuilder.toast` / `app.toast`
- 查询只写 `searchParam.queryParams` / `searchParams`
- 跨服务选人/物料：`getPack({ service: 'base', repository: '...' })` + `select()`
