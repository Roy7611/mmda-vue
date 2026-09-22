# Timeline：程序员怎么写

从 `@mmda/vui` 导入类型；节点用 `builder.factory.timeline`。设计见 [timeline.md](./timeline.md)。

vui 名是 **`timeline`**。不要写 `ejs-timeline` / `TempisTimeline` / `NTimeline` 进 vui。

默认（皮肤列表，对侧相对时间）：

```ts
factory.timeline({
  items: model.events,
  timeField: 'occurredAt',
  labelField: 'title',
  locale: context.locale,
})
```

二维画布轴（时间 × 泳道 + 依赖箭头）是**另一个控件**，走 Builder 具名入口，不碰上面的列表调用：

```ts
import { createTempisTimelinePlugin } from '@mmda/vuix-tempis-timeline'

ui.use(createTempisTimelinePlugin())        // 装插件；未装时 buildTempisTimeline 会 throw
ui.buildTempisTimeline(context, {           // 契约 UiTempisTimelineProps extends UiTimelineProps
  items: model.tasks,
  keyField: 'id',
  labelField: 'title',
  startField: 'start',
  endField: 'end',
  groupingField: 'team',
  categories: [{ name: 'plan', label: '计划' }],
  range: { start: '2026-01-01', end: '2026-02-10' },
  onReady: (controller) => controller.focus({ id: 'launch' }),
})
```

字段：

```ts
fieldFactory.timeline(field, context, {
  timeField: 'occurredAt',
  labelField: 'title',
})
```

单元格相对时间走 `fieldFactory.relativeTime`（MetaUi 别名 `RelativeTime`），不要 `pastTime` / `futureTime`。

## 不要

- 当成 `factory.stepper`
- 当成甘特或 scheduler `timelineWeek`
- 把 EJ2 `Vertical` / `Before` 写进 vui（用 `vertical` / `before`）
- 在皮肤里自己读 `timeField`
