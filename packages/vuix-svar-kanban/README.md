# @mmda/vuix-svar-kanban

`UiKanbanPlugin`（`@svar-ui/vue-kanban`）。不感知 AgNaive 皮肤。契约见 [vui 看板](../vui/docs/kanban.md)。

```ts
import { createVueKanbanPlugin } from '@mmda/vuix-svar-kanban'

ui.setKanbanPlugin(createVueKanbanPlugin())
```

不要把 SVAR `column` / `Willow` / `columnAccessor` 写进 vui props。SVAR 没有泳道。没有原生双击，插件在根节点听 `dblclick`。
