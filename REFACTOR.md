# MMDA 重构说明

本文记录从旧仓 `D:\vue\mmda-vue` 迁到本仓 `D:\2026\ts\mmda` 的设计问题、重构思路、当前结果、与旧代码的不兼容点，以及后续路径。

包级 API 细节见 [packages/core](packages/core/README.md)、[packages/vui/docs/vui.md](packages/vui/docs/vui.md)、[packages/vui-primevue](packages/vui-primevue/README.md)。

## 背景

旧仓是单仓多包（core / vui / vui-primevue / 业务应用），Vue 3 + PrimeVue 4，元数据驱动列表和表单。能跑，但边界长期混在一起：

- core 名义上「框架无关」，实际大量 Vue 会话、弹层和业务文件模型。
- vui 既管会话，又直接依赖 PrimeVue，还堆了 6k 行级的 `ui_context`。
- vui-primevue 既是皮肤，又自己拼页面、自己拼查询、自己带 BPMN / 预览 / App 壳。

新仓目标是 **core 可给 Vue / React / 小程序共用**，vui 只做 Vue 运行时，皮肤只画控件。

当前分层：

```text
utils / extensions → metaui → models → logic → net / di     @mmda/core
                                              ↘
                                          Vue 运行时          @mmda/vui
                                              ↘
                                          控件皮肤            @mmda/vui-primevue
```

计划中：`@mmda/rui`（React，只依赖 core）、可选其它皮肤（如 Syncfusion）。

---

## 原先架构问题

### 分层不清

| 问题 | 表现 |
|------|------|
| core 依赖 UI 生态 | `UiContext` 同时承担网络、弹层、导入导出；`Attachment` / `ReportTemplate` 挂在 `ApiClient` |
| 元数据被运行时污染 | 搜索词、候选项、`filterFn` 写回共享的 `MetaUiField`，多屏互相踩状态 |
| metaui / models / logic 循环 | 校验、分页、字段逻辑路径交叉；同一概念多处定义 |
| vui 依赖 PrimeVue | 无法换皮肤，也无法给 rui 复用会话语义 |
| 皮肤承担运行时职责 | 旧 `PrimeVueUiBuilder` 复制 `_bulidView`、`layoutOne` / `layoutTow`，并在 builder 里拼 GET/POST |

### 会话模型过重

旧 `ui_context.ts` 约 6k 行：主表、子表集合、子表行、选择器、附件、校验、搜索全部挤在一个类里。没有「一实体一份上下文」的硬约定，子表行经常共用父级校验和搜索缓存。

### 查询通道分裂

列表同时存在 `_searchParam`、`_queryParams`、`getAll` / `searchAll` 两套合并逻辑。旧 `searchAll` 用 GET + body，浏览器 Fetch 不允许 GET body。快捷过滤、表头过滤、模糊搜索各自写参数，皮肤也会再拼一遍。

### 布局与校验绑死控件库

- 页级布局写死 9+3（`layoutOne` / `layoutTow`），组密度和页面分栏混在一起。
- 字段校验走 `@vuelidate/core`，和 PrimeVue `invalid` 再叠一层。
- App 壳滚动在外层，页内无法独立 sticky 工具栏。

### 包体积与依赖

vui-primevue 把 bpmn-js、`@vue-office/*`、Chart.js、二维码、Font Awesome 整包、Office Online 嵌入、`@mmda/test-agent` 打进皮肤。未使用的 `html5-qrcode` / `vue-qrcode-reader` 仍在依赖里。

---

## 重构思路

原则：

1. **core 零 UI 框架**。`UiContext` 是跨生态契约，不是 Vue 类型；弹层属于 Application。
2. **一份元数据，多份会话**。主表一个上下文；每个子表行一个上下文；集合级另开。搜索缓存只活在会话上。
3. **vui 不依赖 PrimeVue**。`AbstractUiBuilder` 负责拼屏；皮肤只实现控件、chrome、弹层。
4. **查询状态只有 `EntitySearchParam`**。皮肤绑 UI，不拼请求。
5. **不整文件粘贴旧巨类**。对照行为，按新契约重写。
6. **重型能力可选**。BPMN / 预览 / 图表 / 二维码是 optional peer，不进默认 bundle。

不引入 `UiHost` / `UiSession`；不把 rui 做成 vui 的 React 翻译。

---

## 重构结果

工具链：pnpm 9、Node ≥20.19、Vite 8、Vitest、TypeScript ~5.9。包版本当前均为 `1.2.0`（playground 除外）。

测试（撰写时）：core 116、vui 35、vui-primevue 3。`pnpm build` 覆盖 core / vui / vui-primevue / playground。

### `@mmda/core`

- 分层：utils → metaui → models → logic → net / di。
- `UiContext`：一实体一份；`prev` / `root` 回父级。
- `MetaUiFieldLogic` / `MetaUiGroupLogic`：hide、lock、required、子表行为。
- `FieldSearchOptions` 替代写回字段的 `MetaUiFieldOptions`。
- `validateField` 在 core，不再依赖 vuelidate。
- `EntitySearchParam`：`pager` + `searchWord` + `queryParams`（GET）+ `searchParams`（`EntityFilterModel` body）。
- `ApiClient.searchAll()`：无列过滤走 GET `getAll`；有 `searchParams` 走 POST `.../searchAll`。
- `Attachment` / `ReportTemplate` 在 `models/file.ts`；传输走 `doAction` / `http.postBlob`。
- 组区域：`MetaUiGroup.isPrimary()` / `isSecondary()` / `isTails()`。
- 权限用 `hasBit` / `auth`，不挂 `Number.prototype`。

### `@mmda/vui`

- `MmdaApplication`：DI、鉴权、locale；`toast` / `confirm` / `confirmDialog` 转发 Builder。
- `UiViewContext`：Vue 会话，实现 core `UiContext`。
- `UiBuildContext`：屏级 CRUD、搜索同步、附件/模板调用链。
- `AbstractUiBuilder` 默认实现 `buildView` / `buildListView` / `buildField` / `buildGroup` / `buildTable` / `buildAppScaffold`。
- 布局：`layoutField`、`layoutFieldGroup`（组内列密度）、`layoutPage`（primary / summary / tails + sticky 工具栏）、`AppLayout`（`sidebarLeft` | `topBarFull`）。
- `searchParam` 唯一查询状态；`UiFilter` / `UiSearchField` 只写回该对象。
- 皮肤在 `@mmda/vui-primevue` / `@mmda/vui-syncfusion` / `@mmda/vui-agnaive`；vui 不带默认 HTML factory。
- `UiSelector` 只走 `factory`，不绑 PrimeVue。

公共弹层在 Application，不在 core。`select()` / `subGroupItem()` 属于表单会话。

### `@mmda/vui-primevue`

对照旧包重写，而不是复制 `primevue_builder.ts`（约 5762 行）。

- `PrimeVueUiBuilder` 继承 `AbstractUiBuilder`，实现 chrome、搜索栏、登录、toast/confirm。
- `createPrimeVueUiFactory()`：按钮、DataTable、分页、菜单、dialog/drawer、Chart 入口。
- `createPrimeVueFieldFactory()`：旧 metadata editor/renderer 名（`TextBox`、`DropdownList` 等）映射到 PrimeVue 控件。
- `layout.fieldMessage = false`，校验走控件 `invalid` + `Message`。
- 列过滤写 `filterModel` → `searchParam.searchParams`，不拼 SQL。
- `mmdaPrimeVue` 安装 PrimeVue + Confirmation / Dialog / Toast；根上要挂 `PrimeVueOverlayHost` 或 `MmdaPrimeApp`。
- 可选：`BpmnModeler`、`FilePreview`、`CodeImage`、HelpPanel、图表。

PrimeVue 版本：默认 **4.5.5** + `@primevue/themes` 4.5.4 + PrimeIcons 7。PrimeVue 5 需要 PrimeUI 商业许可证，无许可证时页面被「Invalid PrimeUI License」阻断，因此不作为默认皮肤。

playground 已改用 `PrimeVueUiBuilder`。

---

## 与旧代码的不兼容

业务应用不能把旧 `@mmda/core` / `@mmda/vui` / `@mmda/vui-primevue` 直接换包名升级。主要断裂如下。

### 导入与包边界

| 旧 | 新 |
|----|----|
| 从 vui 深路径导入 i18n locales | 用 `@mmda/vui` 公共导出 |
| vui 依赖 PrimeVue | vui 无 PrimeVue；皮肤单独安装 |
| `Attachment` 方法在 `ApiClient` | 模型在 core，上传下载走通用 HTTP |
| core 内 Vue 弹层 | `MmdaApplication` + `UiBuilder` |

### 会话与校验

| 旧 | 新 |
|----|----|
| 一个大 `UiContext` 管整屏 | 主表 / 子表行分上下文 |
| `@vuelidate/core` | `validateField`（core） |
| 搜索状态写在 `MetaUiField` | `FieldSearchOptions` 在会话上 |
| `MetaUiFieldOptions` | `FieldSearchOptions`（旧名暂 deprecated 别名） |
| `UiContextBase` | 已删除；契约是 `UiContext`，实现是 `UiViewContext` |
| `PCModeType` | 已删；壳布局用 `AppLayout` variant |

### 查询

| 旧 | 新 |
|----|----|
| `_searchParam` + `_queryParams` 双通道 | 仅 `EntitySearchParam` |
| GET `searchAll` + body | POST `searchAll` + JSON body |
| 皮肤拼 filter SQL | `UiFilter` → `queryParams.filter`；列过滤 → `searchParams` |
| 另设 `EntityQueryParam` / `extraParams` | 不增加 |

`MetaUiFilter` 本身未加 `selectionMode` / `presentation`；chips 还是 tabs 由皮肤决定。

### 布局与 Builder

| 旧 | 新 |
|----|----|
| `layoutOne` / `layoutTow` / `layoutTowExpandable` | `layoutPage` 三区 |
| 页级 12 栅格当组密度 | `layoutFieldGroup.cols` 只表示组内字段密度 |
| 皮肤覆盖整页 `buildView` | 默认继承 vui 拼屏，只换控件 |
| 滚动在 App 外壳 | 页内滚动 + sticky toolbar |
| `buildSignupForm` throw | PrimeVue 皮肤提供占位表单 |

### 皮肤与依赖（不迁入）

- 整包 Font Awesome（`src/assets/fa`）→ PrimeIcons
- Office Online（`preview/authority.ts`）
- echarts（旧 mes 全局，不在皮肤）
- `@mmda/test-agent`
- 未使用的 `html5-qrcode` / `vue-qrcode-reader`
- 旧 App 级 `HeaderView`（846 行）完整业务顶栏：新包提供 `MmdaPrimeApp` 骨架，产品顶栏仍应在应用里补

旧 builder 里大量 TODO（子表拖拽、dialog footer、ImagePicker 行内编辑等）没有原样搬过来。

### 类型与拼写

- `UiDirection = 'vertical' | 'horizontal'`
- 旧方法名 `layoutTow` 不再作为 API；不要在新代码里保留这个拼写当正式接口

---

## net 栈（FetchApi / ApiProblem / OAuth2）

旧仓与本仓早期 net 是 `FetchClient`（继承 `HttpClient`）+ `OAuthApiClient`（拦截器打 Bearer）+ 一律 `ApiError`。这次把传输、错误、认证拆开，**不删旧类**。

| | 旧 | 新（推荐） |
|---|---|---|
| 传输 | `FetchClient` | 独立 `FetchApi`（标准 Fetch / Streams / Abort，不继承 `HttpClient`） |
| 错误 | `ApiError` | RFC 9457 `ApiProblem`；固定扩展仅 `validationErrors` |
| 认证 | `setAuthenticator` + `refreshHandler` | `FetchAuthProvider`；`OAuth2ApiClient` 安装 `OAuthBearerAuthProvider` |
| 接到 CRUD | `OAuthApiClient(http)` | `OAuth2ApiClient(fetchApi)` → 内部 `FetchApiHttp(applyFetchAuth)` |
| 应用壳 | `MmdaApplication` 建 `FetchClient` | 已改为 `FetchApi` + `OAuth2ApiClient` |

细节、对照表与测试写法见 [packages/core/docs/net.md](packages/core/docs/net.md)。

---

## 后续路径

### 近期（把皮肤用到业务）

1. 用 [`packages/app`](packages/app) 对人工业务验证：登录、字典 CRUD、Employees 跨服务选人（只拉 mes 元数据）、Users/Roles、Materials、附件、待办。`pnpm dev:app`，网关地址见 `packages/app/.env.example`。
2. 用 playground 对齐真实仓库的列表：快捷过滤、列过滤、分页、导入导出。
3. `AssociationTable`、多文件/多图上传与附件组接到 `UiBuildContext`。
4. 把产品 App 顶栏 / 系统切换接到 `MmdaPrimeApp`，而不是把 mes 的 `HeaderView` 整文件拷回皮肤。
5. 补 vui-primevue 针对 `filterModel` 回写、searchbar、confirm 的 jsdom 测试。

### 中期（能力补齐）

- BPMN：properties panel、Camunda moddle 与 `buildBpmnDiagram` 的只读/可编分流。
- 文件预览：docx/xlsx/pdf 与附件点击；继续禁止 Office Online。
- 图表：Chart.js + PrimeVue Chart；不引入 echarts，除非业务包自己装。
- 国际化：列过滤操作符走 vui `matcher.*`，不要只显示英文 `Starts with`。
- 若需要商业皮肤，再评估 PrimeVue 5 + PrimeUI license，与 4.5 开源线并行，不要 silently 升级。

### 远期（多生态）

- `@mmda/rui`：只依赖 core，重做 React 控件层，不抄 vui 组件。
- 小程序 / Uni：`UniUiBuildContext` 未迁。
- 可选第二皮肤（Syncfusion 等）：同样只实现 `UiFactory` + abstract Builder。
- 删掉 core 里 deprecated 转发路径（`MetaUiFieldOptions`、旧文件位置 re-export），需单独 major。

### 明确不做

- 把 vui-primevue 做成旧 2 万行源码的逐文件镜像。
- 让 vui 重新依赖 PrimeVue。
- 为「兼容旧 mes」恢复 GET body、vuelidate、或把查询拼装放回皮肤。

---

## 迁移清单（业务仓）

1. 依赖改为 workspace / 发布版 `@mmda/core` `@mmda/vui` `@mmda/vui-primevue`，并安装 `vue`、`primevue@^4.5.5`、`@primevue/themes`、`primeicons@^7`。
2. `new PrimeVueUiBuilder()` 交给 `MmdaApplication`；`app.use(mmdaPrimeVue, { locale })`。
3. 根组件渲染 `PrimeVueOverlayHost`。
4. 列表只读写 `context.searchParam`；自定义查询条件进 `queryParams` 或 `UiCustomSearchField`。
5. 子表按行创建上下文，不要复用主表 `UiViewContext` 做行校验。
6. 附件/模板改走 vui 会话方法，不要调用已删除的 `ApiClient` 专用 API。
7. 用 `layoutPage` 区域元数据（primary / `s?` / `t?`）代替手写 9+3 栅格。
