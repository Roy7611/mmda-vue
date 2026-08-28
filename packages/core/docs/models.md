# 数据模型

`models` 保存按界面元数据创建、查询和提交的数据结构。概念上先有
`MetaUi`，再由 `MetaModel` 依据它生成和操作实体。

```text
MetaUi -> MetaModel -> Models
```

## 主要内容

- `Entity` / `EntityState`：实体数据和客户端状态。
- `MetaModel`：创建、赋值、取值、子表操作和可提交数据转换。
- `EntitySearchParam`：实体查询参数。
- `Pager` / `PagedList`：分页请求与结果。
- `Module` / `ModuleAuth`：功能目录、权限和授权操作。
- `Attachment` / `ReportTemplate`：附件和报表模板的实体形状。上传下载走通用 `doAction` / `postBlob`，不在 `ApiClient` 上。

## 实体搜索

`EntitySearchParam` 是列表查询的唯一参数，不另设
`EntityQueryParam`：

```ts
const search: EntitySearchParam = {
  pager: PagerCtor(20),
  searchWord: '仓',
  // GET：接口上下文、快捷过滤
  queryParams: { filter: "status='OPEN'" },
  // body：AG Grid 风格的复杂字段过滤
  searchParams: {
    quantity: {
      filterType: 'number',
      operator: 'BETWEEN',
      value: 10,
      valueTo: 20,
    },
  },
}
```

`ApiClient.searchEntities()` 是统一入口：`searchParams` 为空时调用
GET `getAll`；存在复杂字段条件时调用 POST `searchAll`，同时保留 URL 中的分页、
关键词和 `queryParams`。

```ts
const model = MetaModel.createEntity(Warehouse, metaui, source)
const payload = MetaModel.savable(metaui, model)
```

## 边界

`models` 可以依赖 `metaui`，因为实体操作需要字段、分组和数据类型声明；
`models` 不依赖 `logic`。

以下内容不属于数据模型：

- `EntityAction`：按钮元数据，定义在 `metaui/metaui_action`；
- `UiValidation`：界面校验状态，定义在 `logic/validation`；
- `UiContext`：当前界面交互上下文，定义在 `logic`；
- `DateRangeKind`：通用日期工具，定义在 `utils/date_range`。

旧的 `models/validation`、`metaui/pagination` 等源码路径暂时保留兼容转发；
新代码从 `@mmda/core` 顶层导入。

参见 [metaui.md](./metaui.md) 和 [logic.md](./logic.md)。
