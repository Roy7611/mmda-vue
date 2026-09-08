# 面包屑：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.breadcrumb`。设计见 [breadcrumb.md](./breadcrumb.md)。参数名约定见 [factory.md](./factory.md)。

```ts
builder.factory.breadcrumb({
  items: [
    { label: '组织', to: '/org', icon: 'e-icons e-home' },
    { label: '部门' },
  ],
})
```

模块页路径仍走 `builder.buildModuleBreadcrumb(context, { module, label })`：Builder 拼模块链，内部调 `factory.breadcrumb`。不要自己写 EJ2 `url` / Prime `model`。

## 不要

- `format: 'qr'` 式地把厂商属性塞进 chrome
- 在 Builder 上再开 `buildBreadcrumb(items)`
- 手写 `e-breadcrumb-*` DOM 冒充 Syncfusion 控件
