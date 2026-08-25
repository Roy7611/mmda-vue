# Vue 运行时（@mmda/vui）

面向业务与 vui-primevue 作者。core 定义「界面是什么、实体怎么存」；vui 用 Vue 把它跑成一屏。

## 和 rui 的关系

| 包 | 宿主 |
|---|---|
| `@mmda/core` | 无 UI 框架 |
| `@mmda/vui` | Vue 3 |
| `@mmda/vui-primevue` | Vue + PrimeVue 控件 |
| `@mmda/rui`（计划） | React |

rui **不要** from vui 抄组件。会话语义跟 core 的 `UiContext` / `FieldSearchOptions` / `MetaUiFieldLogic`，控件层各自实现。

## 分层

```text
MmdaApplication ──弹层/toast──► UiBuilder（皮肤实现）
        │
        ▼
UiLogic.beforeEdit ──装配──► UiViewContext（一实体一份会话）
                                │
                                ▼
                          UiBuildContext（屏级 CRUD）
```

`select()` / `subGroupItem()` 属于表单会话，打开层调用 `app.confirmDialog`。

`UiSelector` 在 vui 内：拉元数据与分页数据，渲染走 `$app.ui.factory`（paginator / input / list）。Uni 小程序 `UniUiBuildContext` 未迁。

## 约定

- 搜索缓存用 `FieldSearchOptions`，不要写回 `MetaUiField`
- 字段 hide/lock 写在 `MetaUiFieldLogic` 实例上
- vui 可以依赖 Vue / vue-i18n / vue-router；不要依赖 PrimeVue
- `Attachment` / `ReportTemplate` 从 `@mmda/core` 导入；屏级上传下载走 `UiBuildContext`，不要往 `ApiClient` 加专用方法

## 列表过滤

`UiViewContext.searchParam` 是唯一查询状态：

- `queryParams`：GET 参数；`UiFilter` 快捷条件编译到 `filter`。
- `searchParams`：表头下拉产生的结构化 `EntityFilterModel`。
- `pager.sorts`：唯一排序状态。

`UiBuildContext.search()` 先同步搜索字段和快捷过滤，再由
`ApiClient.searchEntities()` 选择 `getAll` 或 `searchAll`。皮肤只负责
chips、Tab、表头菜单等交互，不得自行拼请求参数。HTML 皮肤提供
`details` 表头菜单作为 fallback；vui-primevue 可映射为
Popover/MultiSelect/DatePicker。
