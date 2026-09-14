# 界面元数据

`metaui` 定义界面是什么，不保存某次打开界面后的交互状态。

## 核心结构

- `MetaUi`：对象界面的根元数据。
- `MetaUiBuilder`：本地列表列声明，见 [metaui_builder.md](./metaui/metaui_builder.md)。
- `MetaUiGroup`：主表或子表分组。
- `MetaUiField`：字段声明、数据类型、展示与引用配置。
- `MetaUiField.filterTypes`：列头过滤器 **TINYINT 位掩码**（`MetaUiFilterType`）。字段推断见 `inferColumnFilterType()`。[metaui_filter.md](./metaui/metaui_filter.md) · [过滤框架](./models/entity_filter_design.md)。
- `SqlDataType`：后端字段类型及默认值映射。
- `MetaUiFilter`：旧快捷 SQL 芯片，不进 `FilterModel`。
- 列表字段条件：`FilterModel` / `FieldFilter` + `MetaUiFilterOpCode`（见 [entity_search.md](./models/entity_search.md)）。
- SQL 片段：`SqlOperator`（where / `refWhere`）。
- 排序只在 `pager.sorts`。本地上次查询是 pack 上的 `lastQuery: EntityQuery`，不单存 sorts。
- `EntityAction`：渲染为按钮的行为声明。
- `MetaUiService`：加载、缓存和组装元数据包（含可选 `lastQuery`）。
- `Module`：功能目录与权限位；`defaultFilter` 是 `[alias.]field[=value]` 固定字段芯片（`t.status=1`；`items.xxx` 先解析）。

```ts
import { MetaUi, MetaUiField, SqlDataType } from '@mmda/core'
```

## 边界

依赖方向是：

```text
metaui → models → logic
```

`metaui` 不依赖实体实例和前端会话。以下内容不属于元数据：

- 当前查询词、分页结果和候选项缓存；
- 当前模型、选中项和弹窗状态；
- 字段/分组交互逻辑；
- 校验状态和校验执行。

这些内容统一放在 `logic`。`MetaUiService` 是例外：它负责获取元数据，可以同时组装模块目录，但不实现一屏交互。

## 字段逻辑

`MetaUiField` 只保存字段声明。关联字段搜索过程中的状态使用
`FieldSearchOptions`，由会话 `UiContext` 维护；字段行为使用
`MetaUiFieldLogic` 配置。

## 快捷过滤与字段查询

`MetaUiFilter` 保持纯元数据：每组包含若干带 `condition` 的预设条件。
core 不声明单选/多选、chips 或 Tab；这些展示策略由 UI 库决定。

同一组已选 condition 使用 OR，不同组使用 AND，最终写入
`EntitySearchParam.queryParams.filter`（兼容路径，仍可走 GET）。
表头产生的类型化复杂条件写入 `EntitySearchParam.filterModel`，
不改写 `MetaUiFilter`。列表主路径是 `searchAll`。

参见 [models.md](./models.md)、[entity_search.md](./models/entity_search.md)、[logic.md](./logic.md)。
