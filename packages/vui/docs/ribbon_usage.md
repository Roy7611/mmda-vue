# Ribbon：程序员怎么写

从 `@mmda/vui` 导入类型；节点用 `app.ui.ribbonPlugin` 或 `ui.buildRibbon`。设计见 [ribbon.md](./ribbon.md)。

```ts
import { SyncfusionUiBuilder } from '@mmda/vui-syncfusion'
import { createSfRibbonPlugin } from '@mmda/vui-syncfusion/ribbon'

const ui = new SyncfusionUiBuilder()
ui.setRibbonPlugin(createSfRibbonPlugin())

ui.buildRibbon({
  layout: 'classic',
  activeTab: 0,
  tabs: [
    {
      header: 'Home',
      groups: [
        {
          header: 'Clipboard',
          collections: [
            {
              items: [
                {
                  type: 'button',
                  label: 'Paste',
                  icon: 'e-icons e-paste',
                  onClick: () => undefined,
                },
                {
                  type: 'dropDown',
                  label: 'Paste Special',
                  items: [{ label: 'Keep Text Only' }],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
})
```

需要 optional peer `@syncfusion/ej2-vue-ribbon`。不要 `factory.ribbon`，不要把它当成 [`toolbar`](./toolbar.md)。
