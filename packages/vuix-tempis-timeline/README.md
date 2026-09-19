# @mmda/vuix-tempis-timeline

[Tempis](https://tempis.dev/) canvas 时间轴。装上之后 `ui.use(createTempisTimelinePlugin())`，同一套 `factory.timeline` 从皮肤事件列表换成时间轴。契约见 [vui Timeline](../vui/docs/timeline.md)。

```ts
import { createTempisTimelinePlugin } from '@mmda/vuix-tempis-timeline'

ui.use(createTempisTimelinePlugin())
```

`@tempis/timeline` 是 optional peer。未安装时 host 显示 `Timeline requires @tempis/timeline`。商用许可由应用处理。后装皮肤 `timelineAsPlugin` 可卸回默认列表。
