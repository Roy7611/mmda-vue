# ProgressBar：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.progressBar`。设计见 [progress_bar.md](./progress_bar.md)。

EJ2：[getting started](https://ej2.syncfusion.com/vue/documentation/progressbar/vue-3-getting-started)。

值是 **0–100**。vui 名是 **`progressBar`**。不要写 `ProgressBarComponent` / `ejs-progressbar` / `NProgress` 进 vui。不要用 `factory.loading` 当进度条。

```ts
factory.progressBar({
  value: model.done,
  showValue: true,
})
```

环形：

```ts
factory.progressBar({
  value: model.done,
  kind: 'circular',
  size: 'small',
})
```

不确定进度：

```ts
factory.progressBar({
  indeterminate: true,
})
```

`modelValue` 也认（与 `value` 同语义）。没有 `onChange`。

## 表单字段

```ts
fldFactory.progressBar(field, context)
fldFactory.progressBar(field, context, { kind: 'circular', showValue: true })
```

内部 `progressBarPropsFromField`：
- `value` ← `getFieldValue`（空 → `0`）
- 不 `setFieldValue`

不要在字段层再 `h(ProgressBarComponent)` / Prime `ProgressBar` / `NProgress`。

## 不要

- 在 Builder 上再开 `buildProgressBar`
- 把 0–1 分数自动 `* 100`（那是 `percentage` 显示字段）
- 把 EJ2 `height` / `trackThickness` 像素写进 vui（粗细只走 `size`）
- 加 `label` / `animation` / `striped` / `secondaryProgress`
- 把 `factory.loading` 当成进度条
