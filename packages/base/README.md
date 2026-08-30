# @mmda/base

么么哒基础数据系统，作为新仓的人工验证应用。通过 `VITE_BASE_API` 访问统一网关 `/api`，不直连 8000/8002，也不依赖 `@mmda/mes`。

## 启动

1. 复制 `.env.example` 为 `.env`，配置 `VITE_BASE_API` 与 `VITE_OAUTH_CLIENT_ID` / `VITE_OAUTH_CLIENT_SECRET`（base 默认 clientId 为 `mmda-base`）。皮肤为 `@mmda/vui-syncfusion`；可选填 `VITE_SYNCFUSION_LICENSE`，否则控件会带 Syncfusion 水印。
2. 在仓库根目录：`pnpm install`，然后 `pnpm dev:base`（默认 http://127.0.0.1:5174/）。
3. 打开 `/BASE/Signin` 登录；OAuth 凭据在 `MmdaApplication` 构造时注入，登录页无需再传。

Playground（`pnpm dev:vui`）仍是假数据对照，不要改成 base。

应用壳、页脚与样式 token 均不依赖具体控件库；`vite.config.ts` 已预留两套皮肤的
source alias。后续切换皮肤只需调整 `main.ts` 的 Builder / Plugin 和 `package.json` 依赖。

## 验收清单（网关 + 真人）

路由都能打开即可，不要求一次测完所有仓库。按风险顺序：

1. 登录、侧栏菜单、Home 待办数
2. 标准字典 CRUD（Units / Countries）：列表、搜索、列过滤、详情、编辑保存
3. Employees：本服务 CRUD；「批量创建」跨服务多选 Workers（只拉 mes 元数据，编译期无 mes 包）。网关达不成 mes 时，应是 API/权限报错
4. Users / Roles 权限与动作
5. Materials 主从 / 关联
6. Attachments 上传下载
7. Notifications + todoCount

占位页：`DailyRecords`、`MaterialCats`、`PartnerCats`。Office Online / 无权限为本地简单页。

## 分层约束

- `package.json` 不得出现 `@mmda/mes`
- 跨服务选人：`getPack({ service: 'mes', repository: 'Workers' })` + `select()`（`ctor` 可选）+ base `Employees.batchSave`
- 标准 CRUD 走元数据路由 `/BASE/:repository`、`/Create`、`/Edit/:id`、`/:id`
- toast 走 `context.uiBuilder.toast` / `app.toast`；查询只写 `searchParam.queryParams` / `searchParams`
