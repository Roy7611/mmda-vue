# Topbar

模块页头组合产品，不是 `factory.toolbar`。

| 类型 | 槽 | Builder |
|---|---|---|
| `UiIndexTopbar` | `start` / `center` / `end` | `buildIndexTopbar` |
| `UiDetailsTopbar` | `start` / `end` | `buildDetailsTopbar` |
| `UiEditTopbar` | `start` / `end` | `buildEditTopbar` |

Index 典型内容：面包屑、搜索、动作（`buttonGroup` / `moreMenuButton`）。Details / Edit：面包屑、动作。动作槽**不必**走 `factory.toolbar`；和现有长相差太多就不要套原生命令条。

`layout: full | medium | compact` 只属于 Index。`showSearchBar` 控制 full/medium 中间搜索、compact 的放大镜。视口 ≤1024 时动作 dense（图标 + tooltip），与 `layout: 'compact'` 不是同一套。

产品动作由 `resolve*TopbarActions` 决定；vui `paintIndexTopbar` 等接到 `actionFactory` 再填槽。皮肤只加 extraMore。

钩子 class：`mmda-index-topbar` / `mmda-details-topbar` / `mmda-edit-topbar`。动作组：`mmda-topbar-actions`。

## 源码

- 契约：[`core/src/ui/builder/topbar.ts`](../../core/src/ui/builder/topbar.ts)
- 实现：[`vui/src/ui/builder/topbar.ts`](../src/ui/builder/topbar.ts)
