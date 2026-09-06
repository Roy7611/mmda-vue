# logic/entity_logic.ts

- **层**：Logic
- **源码**：packages/core/src/logic/entity_logic.ts

## 职责

`EntityLogic`：无 Vue 的 ApiClient + MetaModel CRUD。vui 的 `UiLogic` 继承它。业务 `XxxLogic` 仍 `extends UiLogic`。本文件再导出 field/group logic 与 logic_functions。业务读写用本类方法，不要 `context.globalProps.$api`。本仓库 `getAll` / `load`；别的仓库 `getAllOf<T>` / `loadOf<T>`（不走本类 `createEntity`）；关联检索 `searchRelative<T>`。

不要叫 `EntityManager`、`RepositoryLogic`。`repository` 是 API 路径；`createRepositoryLogic` 是按仓库名取 Logic 的工厂函数。术语见 [docs/naming.md](../../../../docs/naming.md)。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。
