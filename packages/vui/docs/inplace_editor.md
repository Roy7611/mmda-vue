# InplaceEditor 设计

chrome 就地编辑走 `factory.inplaceEditor`。[PrimeVue Inplace](https://primevue.dev/inplace/)，[EJ2 Vue In-place Editor](https://ej2.syncfusion.com/vue/documentation/inplace-editor/vue3-getting-started)。Naive 无厂商件，自绘 display ↔ content。

程序员用法：[inplace_editor_usage.md](./inplace_editor_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

vui 名是 **`inplaceEditor`**。不要 `inplace` / `ejs-inplaceeditor` / `InPlaceEditor` / Prime `Inplace` 当 vui 名。

**不要**和表格列 `inplaceEdit`、皮肤 `nativeInplaceEdit` 混名。不要暴露 fld **`InplaceEditor`**（撞 SF 类）。

字段包装是 **`inplaceFieldEditor`**（PascalCase **`InplaceFieldEditor`**）：用 chrome 包 display + 内层 editor。`editor` / `renderer` 若就是本控件，内层走 `fallbackInput` / `fallbackDisplay`，避免递归。调 `context.uiBuilder.factory.inplaceEditor`。

没有 `default` 槽。控件不 `saveOne`。表单 / 列表 **还没接线**，本轮只提供控件。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/inplace_editor.ts` | `UiInplaceEditorProps` / slots / controller |
| vui `ui/factory/inplace_field.ts` | fld `renderInplaceFieldEditor` |
| 皮肤 `factory/inplace_editor.ts` | SF `InPlaceEditorComponent`；Prime `Inplace`；Naive 自绘 |

## 属性

| 属性 | 说明 |
|---|---|
| `disabled` | 只显示 display，不打开 |
| `active` | 可选受控。缺省点 display 打开 |
| `onOpen` / `onClose` | 开合回调 |
| `onReady` | `UiInplaceEditorController`：`open` / `close` |

slots：`display`、`content`。没有 `default`。

钩子 class：`mmda-inplace-editor`；`--open` / `--disabled`。display / content 子节点：`mmda-inplace-editor__display` / `__content`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 控件 | `InPlaceEditorComponent` | `Inplace` | 自绘 div |
| 模式 | `mode: Inline`，`type: Template` | display / content 槽 | 点 display 换 content |
| 保存钮 | `showButtons: false` | 厂商默认无保存钮 | 无 |
| 远程 | 不设 `url` / `adaptor` | — | — |
| 不要 | EJ2 `type: Text` 自带输入 | 当表格单元格编辑 | 当 `inplaceEdit` |

## 源码

- vui [`inplace_editor.ts`](../src/ui/factory/inplace_editor.ts)
- vui [`inplace_field.ts`](../src/ui/factory/inplace_field.ts)
- Syncfusion [`factory/inplace_editor.ts`](../../vui-syncfusion/src/factory/inplace_editor.ts)
- Prime [`factory/inplace_editor.ts`](../../vui-primevue/src/factory/inplace_editor.ts)
- Naive [`factory/inplace_editor.ts`](../../vui-agnaive/src/factory/inplace_editor.ts)
