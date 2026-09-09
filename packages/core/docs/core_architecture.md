# @mmda/core 包内布局

产品分层 **UI → Logic → Data** 见仓库根目录 [ARCHITECTURE.md](../../../ARCHITECTURE.md)。本文只说明 **本包目录**，不重复产品层论述。

```text
packages/core/src
  mmda_app.ts     ← abstract class MmdaApplication（跨层宿主，不属于 Data）
  ui/             ← UI 契约：UiBuilder / UiFactory / UiContext（无 Vue 实现）
  logic/          ← 产品 Logic 层（EntityLogic / Field·Group Logic）
  metaui/         ← Data：界面元数据、Module、MetaUiBuilder
  models/         ← Data：实体、MetaModel、查询形状
  net/            ← Data：HTTP、ApiClient
  di/             ← Data：依赖注入
  utils/          ← Data：工具
  extensions/     ← Data：类型扩展
```

- **没有 UI 实现。** 契约在 `src/ui/`；vui / 皮肤不在本包。应用壳 abstract class 在 `mmda_app.ts`（`state`，无弹层方法）。
- Data 内部依赖：`utils` / `extensions` → `metaui` → `models` → `net`。`di` 只依赖 utils。
- `metaui` / `models` / `utils` **不** import `logic/`。
- 业务类在 `@mmda/base` / `@mmda/mes`，经 vui `EntityLogic` 继承本包 `EntityLogic`。

模块索引：[index.md](./index.md)。
