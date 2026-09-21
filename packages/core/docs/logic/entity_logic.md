# logic/entity_logic.ts

- **层**：Logic
- **源码**：packages/core/src/logic/entity_logic.ts

## 职责

`EntityLogic`：无 Vue 的 ApiClient + MetaModel CRUD，以及视图钩子 / `viewLogicLoaders` / `applyTo(UiContext)`。

元界面在 `metaUi`，联查列在 `viewUi`（`getViewUi`）。上次查询键 `{repository}/lastQuery`。报表模板 `getReportTemplates`。列设置永久保存 `saveListSettings`。

- 设计：[entity_logic_design.md](./entity_logic_design.md)
- 用法：[entity_logic_usage.md](./entity_logic_usage.md)
- vui 壳：[../../vui/docs/logic.md](../../../vui/docs/logic.md)

业务 `XxxLogic extends EntityLogic`。无定制页用 core 的 `GenericEntityLogic`，业务不要继承。本文件再导出 field/group logic、`SubEntityLogic` 与 logic_functions。业务读写用本类方法，不要 `context.globalProps.$api`。面向用户文案用 `context.t()`。本仓库 `getAll` / `load`；别的仓库 `getAllOf<T>` / `loadOf<T>`；关联检索 `searchRelative<T>`。

树下拉 / 分类树的 `getRoots` / `getChildren` **只写在父子结构的业务 Logic 上**。`EntityLogic` 不提供这两方法：不是每个实体都是树。

不要叫 `EntityManager`、`RepositoryLogic`。`repository` 是 API 路径；`createRepositoryLogic` 是按仓库名取 Logic 的工厂函数。术语见 [docs/naming.md](../../../../docs/naming.md)。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。
- 不要在 `EntityLogic` 里 import vue / vue-router / vui i18n。
