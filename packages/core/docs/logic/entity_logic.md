# logic/entity_logic.ts

- **层**：Logic
- **源码**：packages/core/src/logic/entity_logic.ts

## 职责

`EntityLogic`：无 Vue 的 ApiClient + MetaModel CRUD，以及视图钩子 / `viewLogicLoaders` / `applyTo(UiContext)`。业务 `XxxLogic extends EntityLogic`（从 `@mmda/core` 或 `@mmda/vui` 再导出）。vui 的 `VueEntityLogic` 只做响应式搜索表单，业务不要继承。本文件再导出 field/group logic、`SubEntityLogic` 与 logic_functions。业务读写用本类方法，不要 `context.globalProps.$api`。面向用户文案用 `context.t()`。本仓库 `getAll` / `load`；别的仓库 `getAllOf<T>` / `loadOf<T>`；关联检索 `searchRelative<T>`。

树下拉 / 分类树的 `getRoots` / `getChildren` **只写在父子结构的业务 Logic 上**。`EntityLogic` 不提供这两方法：不是每个实体都是树。

不要叫 `EntityManager`、`RepositoryLogic`。`repository` 是 API 路径；`createRepositoryLogic` 是按仓库名取 Logic 的工厂函数。术语见 [docs/naming.md](../../../../docs/naming.md)。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。
- 不要在 `EntityLogic` 里 import vue / vue-router / vui i18n。
