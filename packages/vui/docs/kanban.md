# 看板插件

看板不进 chrome `factory`。vui 只定 [`UiKanbanPlugin`](../src/ui/factory/kanban.ts)；应用 `setKanbanPlugin` 才挂引擎。皮肤 Builder **默认不挂**。

两家有引擎、一家没有（Prime）→ 皮肤子路径（EJ2）或 **独立 `vuix-*` 包**（SVAR），不是 `factory.kanban`。对齐 [甘特](./gantt.md) / [图](./diagram.md) / [Markdown](./markdown_editor.md)。

程序员用法：[kanban_usage.md](./kanban_usage.md)。chrome 参数约定：[factory.md](./factory.md)。不要和 MES `QualityKanbanLogic` 混名。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/kanban.ts` | 卡 / 列 / `UiKanbanViewProps` / 变更事件；未安装 stub |
| `VueUiBuilder.kanbanPlugin` | 默认 `unimplementedKanbanPlugin`；`setKanbanPlugin`；`buildKanbanView` 转调插件 |
| `@mmda/vui-syncfusion/kanban` | `createSfKanbanPlugin`，EJ2 Kanban（App 默认） |
| `@mmda/vuix-svar-kanban` | `createVueKanbanPlugin`，`@svar-ui/vue-kanban` MIT |

不要 `factory.kanban`。Prime 不实现、不 set。core `UiBuilder` 不加看板方法。不要叫 `kanbanMixin`。不要把 EJ2 `keyField` / `dataSource` 或 SVAR `column` / `columnAccessor` / `Willow` 写进调用方。

## 失败

| 情况 | 错误 |
|---|---|
| 未 `setKanbanPlugin` | `kanban plugin not installed` |
| SF 未装 EJ2 Kanban | 节点文案 `Kanban requires @syncfusion/ej2-vue-kanban` |
| Vue 包未装 SVAR | 节点文案 `Kanban requires @svar-ui/vue-kanban` |

不要静默空节点。

## 两套对照（进 vui 的依据）

原则：**只收两套都能落地、或 MES 看板常用且一侧能 no-op 的**。厂商名不进 vui。

| 能力 | EJ2 | SVAR | vui |
|---|---|---|---|
| 卡 + 列 | `dataSource` / `columns` | `cards` / `columns` | **进** |
| 列 WIP | `minCount` / `maxCount` | `cardLimit`（软限制，无 min） | **进 `maxCount`**；`minCount` 不做 |
| 列折叠 | `allowToggle` / `isExpanded` | `collapsed` | **进 `allowToggle` + `collapsed`** |
| 列内新增 | 内置 dialog | `addCard` 按钮 | **进 `allowAddCard`**（默认 false） |
| 拖拽 | `allowDragAndDrop`；列 `allowDrag`/`allowDrop` | `readonly` 关拖；`intercept` | **进板级 `allowDragAndDrop`**；列级不做 |
| 泳道 | `swimlaneSettings` | **无** | **不做** |
| 只读 | 关拖 + 关 dialog | `readonly` | **进** |
| 虚拟化 | `enableVirtualization` | `render.virtualizeCards` | **进 `virtualizing`** |
| 排序/筛选 | `sortSettings` | `sort` / `filters` | **不做**（宿主先滤再传入 `cards`） |
| 内置编辑器/菜单/REST/undo/export | `dialogSettings` | Editor / ContextMenu / RestDataProvider / Pro | **不做** |
| 列拖换序、跨板 drop、stackedHeaders | 有 | 无 | **不做** |

## 卡与列

`UiKanbanCard`：

| 属性 | 说明 | 包内映射 |
|---|---|---|
| `id` | 主键 | EJ2 `Id` / SVAR `id` |
| `title` | 标题 | EJ2 `headerField`（Title）/ SVAR `label` |
| `status` | 列 key | EJ2 卡上 Status / SVAR `column` |
| `summary?` | 正文 | EJ2 `contentField`（Summary）/ SVAR `description` |
| `tags?` / `assignee?` / `order?` | 标签、经办、列内顺序 | Tags / Assignee·users / RankId |
| `priority?` / `progress?` / `dueDate?` | 可选 | 透传或映射到厂商字段 |
| 其余 | `[field: string]: unknown` | 透传 |

`UiKanbanColumn`：`key`、`header`、`allowToggle?`、`collapsed?`、`maxCount?`、`showCount?`（EJ2 `showItemCount`；SVAR `cardLimit: true`）。

## 视图

| 属性 | 说明 |
|---|---|
| `cards` / `columns` | 列定义驱动布局 |
| `readonly` | 禁拖、禁加卡、禁内置编辑 |
| `allowDragAndDrop` | 默认 true；`readonly` 时强制 false |
| `allowAddCard` | 默认 false；加卡走 Logic 弹层更稳（两套内置编辑器不一致） |
| `virtualizing` | 列内虚拟滚动 |
| `height` / `width` / `class` / `htmlAttributes` | 尺寸与根属性 |

没有泳道（SVAR 没有对等 API）。

## 事件

形态对齐甘特 `onTaskChange`：带 `action`，返回 `false` 可回滚。不要把 EJ2 `actionBegin` 或 SVAR `api.exec` 泄漏出去。

```ts
interface UiKanbanChangeEvent {
  action: 'move' | 'update' | 'add' | 'delete'
  card: UiKanbanCard
  fromStatus?: string | number
  toStatus?: string | number
  beforeId?: string | number | null
  native?: unknown
}
```

| 回调 | 说明 | 引擎映射 |
|---|---|---|
| `onCardChange` | 拖列 / 改卡 / 增删 | EJ2 `dragStop`（`cancel`）←→ SVAR `move-card` intercept；update ←→ `update-card` |
| `onCardClick` | 单击 | EJ2 `cardClick` ←→ SVAR `select-card`（截住，**不打开** Editor） |
| `onCardDblClick` | 双击；宿主开 Logic 弹层 | EJ2 `cardDoubleClick`；SVAR 无原生双击 → Vue 包在根节点听 `dblclick` |
| `onColumnToggle` | 列折叠 | EJ2 列 toggle ←→ SVAR `update-column` `{ collapsed }` |

`add` / `delete` 仅当 `allowAddCard` 为 true 才几乎会从引擎冒出。

### 不做（事件）

EJ2：`drag` / `dragStart`、`actionBegin` / `Complete` / `Failure`、`dialogOpen`、`columnDrag*`、`queryCellInfo`、`cardRendered`、`dataBinding`。  
SVAR：`duplicate-card`、`filter-cards`、`sort-cards`、`request-data` / `provide-data`、`undo` / `redo`、`export-data`。

## 钩子 class

`mmda-kanban`、`mmda-kanban--readonly`。插件可再挂 `mmda-sf-kanban` / `mmda-vue-kanban`。

## 不做

- 不要 `factory.kanban`
- 不要写进 `vui-agnaive` / Prime 皮肤默认装配
- 不要 `@incoder/kanban` / jervis-kanban
- 不要泳道
- 不改 QualityKanban 业务页
