# FloatingActionButton：程序员怎么写

从当前皮肤的 `builder.factory.floatingActionButton` 取节点。设计见 [floating_action_button.md](./floating_action_button.md)。EJ2：[getting started](https://ej2.syncfusion.com/vue/documentation/floating-action-button/vue-3-getting-started)。

```ts
factory.floatingActionButton({
  icon: factory.resolveIcon('create'),
  tooltip: context.t('action.create'),
  onAction: () => create(),
})
```

带文案（extended FAB）：

```ts
factory.floatingActionButton({
  icon: factory.resolveIcon('create'),
  label: context.t('action.create'),
  colorRole: 'primary',
  position: 'bottomRight',
  target: '#main',
  onAction: () => create(),
})
```

颜色只传 `colorRole`，不要 `severity` / `isPrimary`。位置用 `bottomRight`，不要 `TopLeft`。

不要 `factory.fab`、不要把菜单塞进 FAB（那是 SpeedDial，本轮没有）。不要 `builder.buildFab`。

Naive / Prime 是圆钮降级：定位靠 `mmda-fab--{position}` 钩子，皮肤不写死 `right` / `bottom`。
