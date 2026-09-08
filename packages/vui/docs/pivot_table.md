# 透视表插件

透视表不进 chrome `factory`。vui 只定 [`UiPivotPlugin`](../src/ui/factory/pivot_table.ts)；应用 `setPivotPlugin` 才挂引擎。皮肤 Builder **默认不挂**。

程序员用法：[pivot_table_usage.md](./pivot_table_usage.md)。chrome 参数约定：[factory.md](./factory.md)。列表过滤对齐见 [sf-grid-design.md](../../vui-syncfusion/docs/sf-grid-design.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/pivot_table.ts` | AG 轴 props、小写 `aggregate`、stub |
| `VueUiBuilder.pivotPlugin` | 默认 `unimplementedPivotPlugin`；`setPivotPlugin`；`buildPivotTable` 转调 |
| `@mmda/vui-syncfusion/pivot` | `createSfPivotPlugin`，EJ2 PivotView，**只绑本地 `data`** |
| `@mmda/vui-agnaive/pivot` | `createAgPivotPlugin`，AG Grid `pivotMode` |

不要 `factory.pivotTable` / `factory.pivotView`。Logic 不画透视表。core `UiBuilder` 不加透视方法。不要把 EJ2 `dataSourceSettings` 或 AG `ColDef` / `pivotMode` 写进调用方。Prime 无引擎：未 `setPivotPlugin` 则 throw。

## 为什么契约跟 AG

列表已经是「UI 用 EJ2、模型跟 AG」。服务端透视也按 AG SSRM 语义写：

| 服务端动作 | 用途 |
|---|---|
| `filterRows` | 列表 / 行分组（未开透视） |
| `pivotRows` | 开了 `pivotMode` 后的立方块 |

AG 网格内部仍叫 `getRows`；vui / `ApiClient` **不要**把方法写成 `getRows`。请求体仍是 AG 字段：`rowGroupCols` / `pivotCols` / `valueCols` / `groupKeys` / `filterModel` / `sortModel` / `startRow` / `endRow`；透视成功还要 `pivotResultFields`。

仓里 `getPivotValues` / `getPivotDates` 是列头 Set Filter 的 DISTINCT / 日期树，**不是**透视表。

**Syncfusion 吃不了 `filterRows` / `pivotRows`。** SF 服务端是 Syncfusion.EJ2.Pivot.dll 专有 report POST。SF 插件只适合本地 JSON；要对服务端透视，走 AG 插件（本轮尚未接 `ApiClient.pivotRows`）。

## 两家能力差异

| 点 | AG Grid Enterprise | Syncfusion PivotView |
|---|---|---|
| 谁算立方 | SSRM → 你们的 Java；客户端 `rowData` 在浏览器 | 默认整表进浏览器；Server mode 要他们的 .NET 引擎 |
| 轴 | 行分组 / 列标签 / 值 | 同上，另多 **filters 切片轴**（vui **不要**暴露） |
| 聚合名 | 小写 `sum\|count\|avg\|min\|max` | Pascal `Sum\|Count\|…\|DistinctCount` |
| 展开 | SSRM `groupKeys` 懒加载 | `expandAll` / `drilledMembers` |
| 字段 UI | sideBar Columns + group/pivot panel | FieldList + GroupingBar |

vui **小写跟 AG**；SF 皮肤用 `ej2PivotTypeOf` 翻译。`distinctCount`：SF 原样；AG 用短自定义 aggFunc，不要冒充 `count`。

## 失败

| 情况 | 错误 |
|---|---|
| 未 `setPivotPlugin` | `pivot plugin not installed` |

不要静默空节点。

## 属性

| 属性 | 说明 |
|---|---|
| `data` | 行对象数组。本轮两家都用本地 `data` |
| `rows` | 行分组轴 = AG `rowGroupCols` |
| `columns` | 列标签轴 = AG `pivotCols` |
| `values` | 值轴 = AG `valueCols`；`aggregate` 默认 `sum` |
| `showFieldList` | SF FieldList；AG Columns 侧栏 |
| `showGroupingBar` | SF GroupingBar；AG rowGroup / pivot panel |
| `expandAll` | 初始全开 |
| `height` | 高度 |
| `formats` | `{ name, format }`；SF 进 `formatSettings`；AG 能译则译 |
| `onReady` | 引擎就绪回调 |

不要 vui 级 `filters` 轴（EJ2 专有）。未上轴字段由皮肤从 `data` 键补进工具栏。

钩子 class：`mmda-pivot`。

## 皮肤映射

| vui | Syncfusion | AG Grid |
|---|---|---|
| 控件 | `PivotViewComponent` | `AgGridVue` `pivotMode: true` |
| `rows` | `dataSourceSettings.rows` | `rowGroup` / `rowGroupIndex` |
| `columns` | `dataSourceSettings.columns` | `pivot` / `pivotIndex` |
| `values` | `values[].type`（Pascal） | `aggFunc`（小写） |
| `data` | `dataSourceSettings.dataSource` | `rowData` |
| `showFieldList` | `showFieldList` + provide FieldList | `sideBar: 'columns'` |
| `showGroupingBar` | `showGroupingBar` + provide GroupingBar | `rowGroupPanelShow` / `pivotPanelShow` |

## 本轮不做

- Prime 实现
- SF Server engine / OLAP
- AG SSRM 接到 `ApiClient.pivotRows` / `filterRows`（契约已留轴）
- 导出、pivot chart、calculated field UI

## 源码

- vui：[`pivot_table.ts`](../src/ui/factory/pivot_table.ts)
- SF：[`vui-syncfusion/src/factory/pivot_table.ts`](../../vui-syncfusion/src/factory/pivot_table.ts)、[`pivot_plugin.ts`](../../vui-syncfusion/src/pivot_plugin.ts)
- AG：[`vui-agnaive/src/factory/pivot_table.ts`](../../vui-agnaive/src/factory/pivot_table.ts)、[`pivot_plugin.ts`](../../vui-agnaive/src/pivot_plugin.ts)
