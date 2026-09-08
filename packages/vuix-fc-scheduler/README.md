# @mmda/vuix-fc-scheduler

FullCalendar 的 `UiSchedulerPlugin`。皮肤标识 **Fc**（`FcScheduler` / `createFcSchedulerPlugin`）。不替换 `@mmda/vui-syncfusion/schedule`。契约见 [vui 排程插件](../vui/docs/scheduler.md)。

```ts
import { createFcSchedulerPlugin } from '@mmda/vuix-fc-scheduler'

ui.setSchedulerPlugin(createFcSchedulerPlugin())
```

不要把 `FullCalendar` / `ejs-schedule` 当 vui 名。社区版没有资源时间轴：`timeline*` 视图会 throw。
