# 排程插件

排程不进 chrome `factory`。vui 只定 [`UiSchedulerPlugin`](../src/ui/factory/scheduler.ts)；应用 `setSchedulerPlugin` 才挂引擎。皮肤 Builder **默认不挂**。

程序员用法：[scheduler_usage.md](./scheduler_usage.md)。月视**选日**仍是 [calendar.md](./calendar.md)，不是本控件。甘特是 [gantt.md](./gantt.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/scheduler.ts` | 事件 / 资源 / `UiSchedulerViewProps` / 控制器；未安装 stub |
| `VueUiBuilder.schedulerPlugin` | 默认 `unimplementedSchedulerPlugin`；`setSchedulerPlugin`；`buildSchedulerView` 转调插件 |
| `@mmda/vui-syncfusion/schedule` | `createSfSchedulerPlugin`，EJ2 Schedule（App 默认）；组件 `SfScheduler` |
| `@mmda/vuix-fc-scheduler` | `createFcSchedulerPlugin`，FullCalendar；组件 `FcScheduler` |

不要 `factory.scheduler`。不要把 `ejs-schedule` / `FullCalendar` 当 vui 名。皮肤标识 **Sf** / **Fc**。Logic 不画排程。core `UiBuilder` 不加排程方法。

`viewKind === scheduler` 分发到 `buildSchedulerView`。

GSTC 一类「行=资源、横轴可缩放、一行多条」不是 `scheduler`，也不是 `gantt` / `calendar`。

## 失败

| 情况 | 错误 |
|---|---|
| 未 `setSchedulerPlugin` | `scheduler plugin not installed` |
| Fc 使用 `timeline*` | `scheduler timeline view is not supported` |

不要静默空节点，也不要把时间轴悄悄画成周视图。

## 事件

| 属性 | 说明 |
|---|---|
| `id` / `title` / `start` / `end` / `allDay` | 主键、标题、起止 |
| `resourceId` | 单层资源 |
| `location` / `description` / `color` / `readonly` | 地点、说明、色、只读 |
| `recurrenceRule` / `recurrenceException` | iCal RRULE 字符串，不要厂商 Recurrence 对象 |
| `display` | `auto` / `background`（占档） |
| `url` | 点击默认打开。`onEventClick` 返回 `false` 才拦住 |

## 视图

| 属性 | 说明 |
|---|---|
| `view` | `day` / `week` / `workWeek` / `month` / `agenda` / `year` / `timelineDay` 等 |
| `firstDayOfWeek` / `workDays` / `showWeekend` | 与 DatePicker 同一套；工作日缺省 1–5 |
| `workHours` | `{ start, end }` 短串，有则高亮 |
| `startHour` / `endHour` / `slotDuration` | 时间轴可见范围；格宽分钟，缺省 30。不要 EJ2 `timeScale` 对象 |
| `showNowIndicator` / `minDate` / `maxDate` | 当前时刻竖线、可选日期 |
| `allowOverlap` / `allowSelectOverlap` | 缺省 true |
| `allowSelect` | 缺省 false；松手 `onSelectRange` |
| `showHeader` / `showQuickInfo` | 工具栏；快捷弹层仅 SF |
| `hideEmptyAgendaDays` / `dayCount` / `showWeekNumber` | Agenda / N 日 / 周序号 |

`eventContent(event) => VNode` 定制事件块，不要 EJ2 HTML 模板字符串。写在 Vue 视图，不要写进 `*Logic.ts`。`eventClassName` 只加 class。

## 控制器

`onReady` 拿到 `UiSchedulerController`。`onEventChange` / `onEventClick` 返回 `false` 可回滚或拦住 `url`。

| 方法 | 说明 |
|---|---|
| `refresh` / `goToDate` / `setView` / `select` | 数据与导航 |
| `prev` / `next` / `today` / `getVisibleRange` | 翻页与可见区间 |
| `print` | SF 官方 print；Fc 对日历根 `window.print` |
| `exportExcel` | SF `excelExport`；Fc UTF-8 BOM CSV |

钩子 class：`mmda-scheduler`、`mmda-scheduler--readonly`。
