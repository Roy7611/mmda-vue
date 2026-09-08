# MetaUiBuilder

流式拼一份**列表用** `MetaUi`，交给 `factory.table(rows, metaUi)`。源码 [`metaui_builder.ts`](../../src/metaui/metaui_builder.ts)。

不要用它改服务端下发的共享 `MetaUi`。仓库选记录用 `context.select({ repository })`，不必先 Builder。

```ts
import { MetaUiBuilder } from '@mmda/core'

const metaUi = MetaUiBuilder.create('LocalPick')
  .rowNumber()
  .field('code', '编码')
  .field('name', '名称')
  .listed()
  .listSize(120)
  .align('left')
  .fields([{ fieldName: 'qty', displayLabel: '数量' }])
  .build()

const node = context.uiBuilder.factory.table(rows, metaUi, {
  selectionMode: 'single',
})
```

短写：`MetaUiBuilder.list('LocalPick', [{ fieldName: 'code', displayLabel: '编码' }])`。

`.field` 三种：`(name, label?)`、`(init)`、`(name, partial)`。链式 `.listed()` / `.listSize()` / `.align()` 作用在**刚加的那一列**。
