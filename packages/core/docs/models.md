# 数据模型

`models` 保存按界面元数据创建、查询和提交的数据结构。概念上先有
`MetaUi`，再由 `MetaModel` 依据它生成和操作实体。

```text
MetaUi -> MetaModel -> Models
```

## 主要内容

- `Entity` / `EntityState`：实体数据和客户端状态。
- `MetaModel`：创建、赋值、取值、子表操作和可提交数据转换。
- **`EntityQuery` / `EntitySearchParam`**：可保存查询与当次请求；字段条件在 `filterModel`。
- `Pager` / `PagedList`：分页请求与结果；**排序只在 `pager.sorts`**。
- `Module` / `ModuleAuth`：功能目录、权限（类型在 metaui/`module`）。
- `Attachment` / `ReportTemplate`：附件和报表形状。

## 实体搜索（本轮）

列表查询的会话状态是 **`EntitySearchParam`**；可保存形态是 **`EntityQuery`**（不含 `queryParams`）：

```ts
import {
  defaultSearchParam,
  inFilter,
  type EntitySearchParam,
} from '@mmda/core'

const search: EntitySearchParam = {
  ...defaultSearchParam('仓'),
  queryParams: { filter: "status='OPEN'" }, // 兼容：快捷 SQL / 旧 URL
  filterModel: {
    qty: {
      filterType: 'number',
      operator: 'BETWEEN',
      value: 10,
      valueTo: 20,
    },
    status: inFilter(['OPEN', 'USED']),
  },
}
```

`ApiClient.searchAll()` 是统一入口：空 `filterModel` → GET `getAll`；否则 POST `.../searchAll`（body 为 FilterModel 映射）。新代码不要往 `queryParams` 写字段条件。

- 设计：[entity_search.md](./models/entity_search.md)
- 用法：[entity_query_usage.md](./logic/entity_query_usage.md)
- 传输：[api_client.md](./net/api_client.md)

```ts
const model = MetaModel.createEntity(Warehouse, metaui, source)
const payload = MetaModel.savable(metaui, model)
```

## 边界

`models` 可以依赖 `metaui`；`models` 不依赖 `logic`。

不属于数据模型：

- `EntityAction`：按钮元数据（metaui）
- `UiValidation`：界面校验状态（logic）
- `UiContext`：跨场景宿主（logic）
- `SqlOperator`：where / refFilter 片段（logic）

新代码从 `@mmda/core` 顶层导入。

参见 [metaui.md](./metaui.md) 和 [logic.md](./logic.md)。
