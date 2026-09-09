# `UiLayout`（core）

契约源码：[`src/ui/layout.ts`](../../src/ui/layout.ts)。

分层、类型、钩子的设计真源：[vui 布局设计](../../../vui/docs/layout.md)。程序员怎么写：[layout_usage.md](../../../vui/docs/layout_usage.md)。

core 提供：

- 类型：`UiOrientation`、`UiHorzAlign`、`UiVertAlign`、`UiFieldGroupOrientation`
- `interface UiLayout<TNode>`
- `abstract class AbstractUiLayout<TNode> implements UiLayout<TNode>`

不要在此引入 Vue。不要建模 `VNodeChild`。`UiDirection` 已弃用，用 `UiOrientation`。
