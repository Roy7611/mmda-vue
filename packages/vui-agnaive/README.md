# @mmda/vui-agnaive

AG Grid Enterprise + Naive UI skin for `@mmda/vui`.

按 **components → factory → builder**：`components/AgGrid` 吃 `data` + `MetaUi`；`createAgNaiveUiFactory` 生产它（`factory.table` / `treeGrid`）。vui Builder 只拼工具栏和会话，不 import ag-grid。表单、弹层、菜单按需引入 Naive UI。不要使用 `NDataTable`。约定见 [vui Builder](../vui/docs/builder.md)。列表远程排序/过滤与 Syncfusion、Prime 同一套：`searchParam` + return Promise，见 [列表契约](../vui/docs/list.md#远程排序--过滤皮肤契约)。

```ts
import { mmdaAgNaive, AgNaiveUiBuilder } from '@mmda/vui-agnaive'

const builder = new AgNaiveUiBuilder()
app.use(mmdaAgNaive, { locale: 'zh', licenseKey: import.meta.env.VITE_AG_GRID_LICENSE })
```

Playground: `pnpm dev:vui`（仿 app 壳，假数据）。
