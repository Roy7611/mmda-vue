# InplaceEditor：程序员怎么写

从 `@mmda/vui` 导入类型；节点用 `builder.factory.inplaceEditor`。字段用 `fieldFactory.inplaceFieldEditor`。设计见 [inplace_editor.md](./inplace_editor.md)。

vui chrome 名是 **`inplaceEditor`**。fld 名是 **`inplaceFieldEditor`** / **`InplaceFieldEditor`**。不要写 `inplace` / `ejs-inplaceeditor` / `InPlaceEditor` / `Inplace` 进 vui。不要当表格 `editable`。

```ts
factory.inplaceEditor(
  {
    onOpen: () => undefined,
    onClose: () => undefined,
    onReady: (c) => {
      editor = c
    },
  },
  {
    display: () => h('span', name),
    content: () => factory.textInput({ value: name, onChange: setName }),
  },
)
```

受控打开：

```ts
factory.inplaceEditor(
  { active: open, onOpen: () => setOpen(true), onClose: () => setOpen(false) },
  {
    display: () => h('span', name),
    content: () => factory.textInput({ value: name, onChange: setName }),
  },
)
```

元数据字段（表单还没自动接线，可先手写）：

```ts
fieldFactory.inplaceFieldEditor(field, context)
// 或 editor / renderer: 'InplaceFieldEditor'
```

内层仍看字段自己的 `renderer` / `editor`。两者若写成 `InplaceFieldEditor`，内层退回 `fallbackDisplay` / `fallbackInput`。

## 不要

- 指望本控件 `saveOne` 或表格批量提交
- 给 chrome 写 `default` 槽
- fld 名写成 `InplaceEditor`（SF 类）
- 和 `nativeInplaceEdit` / 表 `editable` 当同一个 API
