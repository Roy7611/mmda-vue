# 透视表：程序员怎么写

从 `@mmda/vui` 导入类型；节点用 `ui.buildPivotTable`（或 `app.ui.buildPivotTable`）。设计见 [pivot_table.md](./pivot_table.md)。

## Syncfusion（App 默认）

**仅本地 `data`。** 不要让 SF 去打 `filterRows` / `pivotRows`。

```ts
import { SyncfusionUiBuilder } from '@mmda/vui-syncfusion'
import { createSfPivotPlugin } from '@mmda/vui-syncfusion/pivot'

const ui = new SyncfusionUiBuilder()
ui.setPivotPlugin(createSfPivotPlugin())

ui.buildPivotTable({
  data: [
    { country: 'CN', year: 2026, amount: 10 },
    { country: 'US', year: 2026, amount: 20 },
  ],
  rows: [{ name: 'country' }],
  columns: [{ name: 'year' }],
  values: [{ name: 'amount', aggregate: 'sum' }],
  showFieldList: true,
  height: 420,
})
```

App 已在 `main.ts` 挂 `createSfPivotPlugin()`。

## AG Grid（playground / Naive）

```ts
import { AgNaiveUiBuilder } from '@mmda/vui-agnaive'
import { createAgPivotPlugin } from '@mmda/vui-agnaive/pivot'

const ui = new AgNaiveUiBuilder()
ui.setPivotPlugin(createAgPivotPlugin())

ui.buildPivotTable({
  data,
  rows: [{ name: 'country' }],
  columns: [{ name: 'year' }],
  values: [{ name: 'amount', aggregate: 'sum' }],
  showFieldList: true,
  showGroupingBar: true,
})
```

playground 已在 `main.ts` 挂 `createAgPivotPlugin()`。服务端透视下一轮接 `ApiClient.pivotRows`（列表分组走 `filterRows`）。

## 不要

- `factory.pivotTable` / `factory.pivotView`
- 把 EJ2 `dataSourceSettings` / AG `ColDef` / `pivotMode` 写进调用方
- vui 方法名写成 `getRows`（服务端是 `filterRows` / `pivotRows`）
- 指望 SF 插件打同一套服务端透视接口
