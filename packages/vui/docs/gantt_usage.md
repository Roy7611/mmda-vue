# 甘特：程序员怎么写

从 `@mmda/vui` 导入类型；节点用 `app.ui.ganttPlugin` 或 `ui.buildGanttView`。设计见 [gantt.md](./gantt.md)。

Syncfusion（App 默认）：

```ts
import { SyncfusionUiBuilder } from '@mmda/vui-syncfusion'
import { createSfGanttPlugin } from '@mmda/vui-syncfusion/gantt'

const ui = new SyncfusionUiBuilder()
ui.setGanttPlugin(createSfGanttPlugin())

ui.buildGanttView(context, {
  tasks: [
    {
      id: 1,
      name: '下料',
      startDate: '2026-01-01',
      duration: 3,
    },
  ],
  links: [],
  viewMode: 'week',
  height: '70vh',
})
```

DlhSoft Hyper Library（独立包，不换默认皮肤）：

```ts
import { createHyperGanttPlugin } from '@mmda/vuix-hyper-gantt'

ui.setGanttPlugin(createHyperGanttPlugin({ license: import.meta.env.VITE_DLHSOFT_GANTT_LICENSE }))

const vnode = ui.buildGanttView(context, {
  tasks: [{ id: 1, name: '下料', startDate: '2026-01-01', duration: 3, assignments: 'R1' }],
  links: [{ source: 1, target: 2, type: 'FS', lag: 0 }],
  assignableResources: ['R1'],
  dependencyConstraints: true,
  onReady: (ctl) => {
    ctl.print({ title: '排程', rotate: true })
    const xml = ctl.getProjectXml()
    ctl.levelResources()
  },
})
```

需要 optional peer `@dlhsoft/ganttcharthyperlibrary`。`buildGanttChart` 与 `buildGanttView` 相同。不要 `factory.gantt`。
