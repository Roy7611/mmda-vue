# 排程：程序员怎么写

从 `@mmda/vui` 导入类型；节点用 `app.ui.schedulerPlugin` 或 `ui.buildSchedulerView`。设计见 [scheduler.md](./scheduler.md)。EJ2 入门：[Schedule Vue 3](https://ej2.syncfusion.com/vue/documentation/schedule/getting-started-vue-3)。

Syncfusion（App 默认）：

```ts
import { SyncfusionUiBuilder } from '@mmda/vui-syncfusion'
import { createSfSchedulerPlugin } from '@mmda/vui-syncfusion/schedule'

const ui = new SyncfusionUiBuilder()
ui.setSchedulerPlugin(createSfSchedulerPlugin())

ui.buildSchedulerView(context, {
  events: [
    {
      id: 1,
      title: '下料',
      start: '2026-01-06T08:00:00',
      end: '2026-01-06T10:00:00',
      location: '一线',
    },
  ],
  view: 'week',
  firstDayOfWeek: 1,
  workHours: { start: '09:00', end: '18:00' },
  height: '70vh',
  onEventClick: (event) => {
    if (!event.url) return false
  },
  eventContent: (event) => h('span', event.title),
})
```

FullCalendar（独立包 `@mmda/vuix-fc-scheduler`，不换默认皮肤）：

```ts
import { createFcSchedulerPlugin } from '@mmda/vuix-fc-scheduler'

ui.setSchedulerPlugin(createFcSchedulerPlugin())
```

`viewKind: 'scheduler'` 时 `ui.build(context)` 也会走到本插件。不要 `factory.scheduler`。不要 `factory.calendar` 当排程。Fc 不要传 `timeline*`。
