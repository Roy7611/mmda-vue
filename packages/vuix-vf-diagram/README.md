# @mmda/vuix-vf-diagram

Prime / Naive 共用的 `UiDiagramPlugin`（Vue Flow）。不依赖皮肤包。契约见 [vui 图插件](../vui/docs/diagram.md)。

```ts
import { createVueDiagramPlugin } from '@mmda/vuix-vf-diagram'

ui.setDiagramPlugin(createVueDiagramPlugin())
```

`@vue-flow/core` 是 optional peer。BPMN 只是 `diagramType: 'workflow'` 左栏一组自定义节点，**不是** bpmn-js XML。标准 BPMN 文件仍走皮肤 `buildBpmnDiagram`。
