# 看板：程序员怎么写

从 `@mmda/vui` 导入类型；节点用 `ui.buildKanbanView`。设计见 [kanban.md](./kanban.md)。

## Syncfusion（App）

EJ2 Kanban 在皮肤子路径，默认不挂：

```ts
import { SyncfusionUiBuilder } from '@mmda/vui-syncfusion'
import { createSfKanbanPlugin } from '@mmda/vui-syncfusion/kanban'

const ui = new SyncfusionUiBuilder()
ui.setKanbanPlugin(createSfKanbanPlugin())

ui.buildKanbanView({
  columns: [
    { key: 'todo', header: '待做' },
    { key: 'doing', header: '进行中', maxCount: 5 },
    { key: 'done', header: '完成' },
  ],
  cards: [
    { id: 1, title: '下料', status: 'todo', summary: '第一序' },
  ],
  height: '70vh',
  onCardChange: (event) => {
    // 返回 false 回滚拖拽（EJ2 dragStop.cancel）
    if (event.action === 'move' && event.toStatus === 'done') return false
  },
  onCardClick: (card) => {
    void card.id
  },
  onCardDblClick: (card) => {
    // 自己开 Logic 弹层；不要依赖厂商内置 Editor
    void card.id
  },
})
```

Vite 源码消费请合并 `@mmda/vui-syncfusion/vite` 的 `syncfusionThemeAliases`。

## SVAR（Playground / Naive）

```ts
import { createVueKanbanPlugin } from '@mmda/vuix-svar-kanban'

ui.setKanbanPlugin(createVueKanbanPlugin())
```

SVAR 没有泳道、没有原生双击（插件在根节点听 `dblclick`）。`select-card` 被截住，不打开 SVAR Editor。

## 注意

- Prime 不要 `setKanbanPlugin`；未 set 时 `buildKanbanView` 抛 `kanban plugin not installed`。
- 不要 `factory.kanban`。
- `allowAddCard` 默认 false；加卡用 `onCardClick` / `onCardDblClick` + Logic 弹窗。
- 不要把 EJ2 `keyField` / SVAR `column` / `Willow` 写进 vui props。
