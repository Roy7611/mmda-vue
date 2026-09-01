# @mmda/mes

> MES 现在是 `@mmda/app` 的制造执行业务插件，只注册 `/MES/*`、
> `service=mes`、Logic 与甘特/BPMN 自定义页面。统一 AppShell、登录和
> EntityView 由 `@mmda/app` 提供。详见
> [`../../docs/unified-app.md`](../../docs/unified-app.md)。

制造执行业务插件，从旧仓 `D:\vue\mmda-vue\packages\mes` 迁到本仓。

## 启动

统一入口：根目录 `pnpm dev:app` → http://127.0.0.1:5174/MES/。

1. 复制 `packages/app/.env.example` 为 `packages/app/.env`。
2. 仓库根目录执行 `pnpm install`，然后执行 `pnpm dev:app`。
3. 在 `/Signin` 统一登录，然后直接访问 `/MES/`。

## 移植边界

- 标准 CRUD 走元数据路由 `/MES/:repository`、`/Create`、`/Edit/:id`、`/:id`，交互逻辑在 `src/modules/**/*Logic.ts`。
- 编译期可引用 `@mmda/base/src/...`（枚举与跨服务模型类型），不引用 `@mmda/iot` / `@mmda/srm`（仅 `src/compat` 桩）。
- AppShell 与通用 EntityView 位于 `@mmda/app`；MES 只注册业务 Logic 与自定义页面。
- 生产排程 / 项目排程走 `UiBuilder.buildGanttChart`（Syncfusion EJ2 Gantt），BPMN 使用 `bpmn-js`。

## 分层约束

- toast 走 `context.uiBuilder.toast` / `app.toast`
- 查询只写 `searchParam.queryParams` / `searchParams`
- 跨服务选人/物料：`getPack({ service: 'base', repository: '...' })` + `select()`
