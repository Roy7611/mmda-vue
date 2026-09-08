# Sidebar / Drawer：怎么写

从当前皮肤的 `builder.factory.sidebar` / `factory.drawer` 取节点。设计见 [sidebar.md](./sidebar.md)。EJ2：[Sidebar getting started](https://ej2.syncfusion.com/vue/documentation/sidebar/vue-3-getting-started)。

```ts
factory.sidebar({
  isOpen,
  type: 'Push',
  width: 280,
  enableDock: true,
  dockSize: 72,
  target: '#main',
  mediaQuery: '(min-width: 600px)',
  onChange: (open) => {
    isOpen = open
  },
})

factory.drawer({
  isOpen,
  position: 'Right',
  onChange: (open) => {
    isOpen = open
  },
})
```

`drawer` 等于 `sidebar({ ...props, type: 'Over', showBackdrop: true })`。不要传 `type`。旧调用里的 `visible` / `onUpdateVisible` 只在 drawer 入口还能认。
