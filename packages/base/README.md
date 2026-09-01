# @mmda/base

> BASE 现在是 `@mmda/app` 的基础数据业务插件，不再拥有生产环境
> AppShell、登录页或 Router 实例。统一应用架构见
> [`../../docs/unified-app.md`](../../docs/unified-app.md)。

么么哒基础数据业务插件，不依赖 `@mmda/mes`。

## 启动

统一入口：根目录 `pnpm dev:app` → http://127.0.0.1:5174/BASE/。

1. 复制 `packages/app/.env.example` 为 `packages/app/.env`，配置 API、OAuth 与 Syncfusion license。
2. 仓库根目录执行 `pnpm install`，然后执行 `pnpm dev:app`。
3. 打开 `/Signin` 登录；OAuth 凭据在 `MmdaApplication` 构造时注入，登录页无需再传。

Playground（`pnpm dev:vui`）仍是假数据对照，不要改成 base。

应用壳、页脚与 Router 位于 `@mmda/app`；本包通过 `basePlugin` 贡献 Home、
占位页和 Logic loaders。

## 验收清单（网关 + 真人）

路由都能打开即可，不要求一次测完所有仓库。按风险顺序：

1. 登录、侧栏菜单、Home 待办数
2. 标准字典 CRUD（Units / Countries）：列表、搜索、列过滤、详情、编辑保存
3. Employees：本服务 CRUD；「批量创建」跨服务多选 Workers（只拉 mes 元数据，编译期无 mes 包）。网关达不成 mes 时，应是 API/权限报错
4. Users / Roles 权限与动作
5. Materials 主从 / 关联
6. Attachments 上传下载
7. Notifications + todoCount

占位页：`DailyRecords`、`MaterialCats`、`PartnerCats`。Office Online / 无权限页由 `@mmda/app` 提供。

## 分层约束

- `package.json` 不得出现 `@mmda/mes`
- 跨服务选人：`getPack({ service: 'mes', repository: 'Workers' })` + `select()`（`ctor` 可选）+ base `Employees.batchSave`
- 标准 CRUD 走元数据路由 `/BASE/:repository`、`/Create`、`/Edit/:id`、`/:id`
- toast 走 `context.uiBuilder.toast` / `app.toast`；查询只写 `searchParam.queryParams` / `searchParams`
