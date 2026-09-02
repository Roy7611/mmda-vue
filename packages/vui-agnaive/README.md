# @mmda/vui-agnaive

AG Grid Enterprise + Naive UI skin for `@mmda/vui`.

表格由 `MmdaAgGrid` 根据 `data` + `MetaUi` 渲染；表单、弹层、菜单按需引入 Naive UI。不要使用 `NDataTable`。

```ts
import { mmdaAgNaive, AgNaiveUiBuilder } from '@mmda/vui-agnaive'

const builder = new AgNaiveUiBuilder()
app.use(mmdaAgNaive, { locale: 'zh', licenseKey: import.meta.env.VITE_AG_GRID_LICENSE })
```

Playground: `pnpm dev:vui:agnaive`（`VITE_SKIN=agnaive`）。
