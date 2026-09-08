# 图：程序员怎么写

从 `@mmda/vui` 导入类型；节点用 `app.ui.diagramPlugin` 或 `ui.buildDiagramView`。设计见 [diagram.md](./diagram.md)。

```ts
import { SyncfusionUiBuilder } from '@mmda/vui-syncfusion'
import { createSfDiagramEditorPlugin } from '@mmda/vui-syncfusion/diagram-editor'

const ui = new SyncfusionUiBuilder()
ui.setDiagramPlugin(createSfDiagramEditorPlugin())

ui.buildDiagramView(context, {
  diagramType: 'workflow',
  nodes: [
    {
      id: 'start',
      text: '开始',
      offsetX: 80,
      offsetY: 80,
      shape: { family: 'bpmn', kind: 'startEvent' },
    },
  ],
  connectors: [],
})
```

Prime / Naive：

```ts
import { createVueDiagramPlugin } from '@mmda/vuix-vf-diagram'

ui.setDiagramPlugin(createVueDiagramPlugin())
ui.diagramPlugin.diagramView({ diagramType: 'org', nodes, connectors })
```

只要 BPMN 图元、不要基础流程：

```ts
import { diagramPaletteOf } from '@mmda/vui'

ui.diagramPlugin.diagramView({
  diagramType: 'workflow',
  palette: diagramPaletteOf('workflow').filter((group) => group.id === 'bpmn'),
  nodes,
})
```

不要 `factory.diagram`。不要把 EJ2 `type: 'Bpmn'` 写进调用方。需要 `.bpmn` XML 时用皮肤 `buildBpmnDiagram`，不要和本插件混用。
