# 图插件

图不进 chrome `factory`。vui 只定 [`UiDiagramPlugin`](../src/ui/factory/diagram.ts)；应用 `setDiagramPlugin` 才挂引擎。皮肤 Builder **默认不挂**。

程序员用法：[diagram_usage.md](./diagram_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/diagram.ts` | `UiDiagramType` / 节点连线 / `UiDiagramViewProps`；未安装 stub |
| `VueUiBuilder.diagramPlugin` | 默认 `unimplementedDiagramPlugin`；`setDiagramPlugin`；`buildDiagramView` 转调插件 |
| `@mmda/vui-syncfusion/diagrams` | `createSfDiagramPlugin`，EJ2 Diagram（兼容路径） |
| `@mmda/vui-syncfusion/diagram-editor` | 同上，正式路径 `createSfDiagramEditorPlugin` |
| `@mmda/vuix-vf-diagram` | Prime 与 Naive 共用：`createVueDiagramPlugin`（Vue Flow） |

不要 `factory.diagram`。Logic 不画图。core `UiBuilder` 不加图方法。不要叫 `diagramMixin`。

## 大类

```ts
type UiDiagramType = 'org' | 'workflow' | 'dataflow' | 'er' | 'uml'
```

| 大类 | 左栏 Accordion |
|---|---|
| `org` | 部门 / 岗位 / 人员 |
| `workflow` | 流程图 + BPMN（不是 bpmn-js XML） |
| `dataflow` | DFD：外部实体 / 处理 / 数据存储 / 数据流 |
| `er` | 实体 / 属性 / 联系 |
| `uml` | 类图 / 活动图 |

`shape: { family, kind }`。不要顶层 `bpmn` / `flowchart` / `umlClass`。

## 失败

| 情况 | 错误 |
|---|---|
| 未 `setDiagramPlugin` | `diagram plugin not installed` |
| 引擎没有这张图 | `not supported: <type>` |

## 只读

`UiViewOne.Details` 或 `readonly: true`：无 palette、不 `onUpdate`。Create/Edit 可拖。标准 BPMN XML 仍走皮肤 `buildBpmnDiagram`（bpmn-js），与本插件分开。

钩子 class：`mmda-diagram`、`mmda-diagram-palette`、`mmda-diagram-aside`。
