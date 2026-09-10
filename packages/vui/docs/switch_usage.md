# Switch：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.switch`。设计见 [switch.md](./switch.md)。

EJ2：[getting started](https://ej2.syncfusion.com/vue/documentation/switch/vue-3-getting-started)。

vui 名是 **`factory.switch`**（对象属性）。不要 `import { switch }`、`function switch`、`SwitchComponent` / `ejs-switch` / `NSwitch`。不要用 `checkBox` 冒充开关。

```ts
factory.switch({
  checked: model.on,
  onChange: (checked) => {
    model.on = checked
  },
})
```

不要 `factory.switch(value, props)`。不要 `trueValue` / `falseValue`。不要 chrome `toggleSwitch`。

SF 可带轨道文案：

```ts
factory.switch({
  checked: model.on,
  onLabel: '开',
  offLabel: '关',
})
```

## 表单字段

```ts
fldFactory.switch(field, context)
fldFactory.switch(field, context, { onLabel: '是', offLabel: '否' })
```

内部 `switchPropsFromField`：`checked` ← `getFieldValue`，只读 → `disabled`。

旧元数据 `editor: Switcher` 仍指向本控件。新元数据写 `switch`。

不要在字段层再 `control(SwitchComponent)`。

## 不要

- 在 Builder 上再开 `buildSwitch`
- `import { switch } from '@mmda/vui'`
- 用 `factory.checkBox` 当滑动开关
