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

换成 Tempis 轴（同一调用）：

```ts
import { createTempisTimelinePlugin } from '@mmda/vuix-tempis-timeline'

ui.setTimelinePlugin(createTempisTimelinePlugin())
```

区间条用 `startField` / `endField`。卸插件：`ui.setTimelinePlugin(null)`。

字段：

```ts
fldFactory.timeline(field, context, {
  timeField: 'occurredAt',
  labelField: 'title',
})
```

单元格相对时间走 `fldFactory.relativeTime`（MetaUi 别名 `RelativeTime`），不要 `pastTime` / `futureTime`。

## 不要

- 当成 `factory.stepper`
- 当成甘特或 scheduler `timelineWeek`
- 把 EJ2 `Vertical` / `Before` 写进 vui（用 `vertical` / `before`）
- 在皮肤里自己读 `timeField`
