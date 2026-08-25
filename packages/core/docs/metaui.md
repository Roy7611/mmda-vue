# 界面元数据

`metaui` 定义界面是什么，不保存某次打开界面后的交互状态。

## 核心结构

- `MetaUi`：对象界面的根元数据。
- `MetaUiGroup`：主表或子表分组。
- `MetaUiField`：字段声明、数据类型、展示与引用配置。
- `SqlDataType`：后端字段类型及默认值映射。
- `MetaUiFilter` / `MetaUiSortSet` / SearchOp：过滤、排序和搜索声明。
- `EntityAction`：渲染为按钮的行为声明。
- `MetaUiService`：加载、缓存和组装元数据包。

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
`FieldSearchOptions`，由 `UiContext` 维护；字段行为使用
`MetaUiFieldLogic` 配置。

## 快捷过滤与字段查询

`MetaUiFilter` 保持纯元数据：每组包含若干带 `condition` 的预设条件。
core 不声明单选/多选、chips 或 Tab；这些展示策略由 UI 库决定。

同一组已选 condition 使用 OR，不同组使用 AND，最终写入
`EntitySearchParam.queryParams.filter`，因此快捷过滤仍可通过 GET 查询。
表头产生的类型化复杂条件写入 `EntitySearchParam.searchParams`
（`EntityFilterModel`），不改写 `MetaUiFilter`。

参见 [models.md](./models.md) 和 [logic.md](./logic.md)。
