# Tabs

chrome 页签走 `factory.tabs`。契约 `UiTabsProps` 在 `@mmda/core`。[EJ2 Vue Tab](https://ej2.syncfusion.com/vue/documentation/tab/getting-started-vue-3) / [API](https://ej2.syncfusion.com/vue/documentation/api/tab/) 就是这个控件（EJ2 名单数 Tab）。

程序员用法：[tabs_usage.md](./tabs_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

## 分层

- vui `ui/factory/tabs.ts`：`UiTabsProps`
- 皮肤 `factory/tabs.ts`：`createTabs`
- 不是字段控件：没有 `fldFactory.tabs`

帮助面板仍直接拼厂商 Tab，不经过 chrome。

## 属性

- `items`：每项 `header`（字符串或 `{ text, iconCss }`）、`content`、`disabled`
- `value`：选中下标，缺省 0。也认 `modelValue`。不要 `selectedItem` / `activeTab`
- `headerPlacement`：`Top` / `Bottom` / `Left` / `Right`，缺省 Top。不要 `placement`
- `scrollable`：boolean，缺省 true。`false` 时 SF 走 Popup。不要 `overflowMode`
- `heightAdjustMode`：`None` / `Auto` / `Content` / `Fill`，缺省 **Fill**
- `onChange(value: number)`，以及 `onUpdate:modelValue` / `onUpdate`

钩子 class：`mmda-tabs`；`--top` / `--bottom` / `--left` / `--right`；`--scrollable` / `--popup`；`--none` / `--auto` / `--content` / `--fill`。

## 皮肤映射

| vui | SF | Prime | Naive |
|---|---|---|---|
| `items[].header` | `header: { text, iconCss }` | `Tab` 文本；`iconCss` → `i.class` | `NTabPane` `tab` |
| `items[].content` | `content` 函数 | `TabPanel` 默认槽 | `NTabPane` 默认槽 |
| `items[].disabled` | item `disabled` | `Tab` `disabled` | `NTabPane` `disabled` |
| `value` | `selectedItem` | `Tabs` `value`（下标） | `NTabs` `value`（下标） |
| `headerPlacement` | `headerPlacement` | class + flex | `placement` 小写 |
| `scrollable: true` | `overflowMode: Scrollable` | `scrollable: true` | `--scrollable` |
| `scrollable: false` | `overflowMode: Popup` | `scrollable: false` | `--popup` |
| `heightAdjustMode` | 原样 | `--fill` 等；Fill 时 `height: 100%` | 同 Prime |
| `onChange` | `selected` → `selectedIndex` | `update:value` | `update:value` |

本轮不暴露 `selecting` 取消、增删页、动画、拖拽排序。

## 源码

- vui：[`tabs.ts`](../src/ui/factory/tabs.ts)
- 皮肤：各包 `factory/tabs.ts`
