# metaui/metaui_group.ts

- **层**：Data / metaui
- **源码**：packages/core/src/metaui/metaui_group.ts

## 职责

组与整页声明。组回调类型在 logic_functions。

类型分层与 `MetaUiField` / `MetaUiFieldInit` 相同：声明写一份，class 靠同名 interface 合并。

- `MetaUiGroupInit`：主/子共用声明（`groupName` / `groupLabel` / `groupIdx` / `secondary`）。
- `MetaUiMasterGroup`：主表组，`master()` 入参，只加 `fields`。
- `MetaUiSubGroup`：子表组，`sub()` 入参；`relObjName` / `joinOn` / `groupUi` 必填。
- `MetaUiGroup`：运行时接口 = Init + `many` + 子表专有（可选）+ `joinFields` / `expanded` / `aggregate`。服务端 JSON 带 `many` 直接 `new MetaUiGroup(g)`。
- `MetaUiInit`：整页声明。`assembled` 只在构造袋里，折成 `assembleStatus`。
- `MetaUi`：Init 合并后只多 `groups` 实例和 `assembleStatus`。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。
