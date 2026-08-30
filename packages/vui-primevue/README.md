# @mmda/vui-primevue

`@mmda/vui` 的 PrimeVue 4.5 控件皮肤。页面结构、查询状态和 CRUD
仍由 vui 管理；本包负责 PrimeVue VNode、字段编辑器、表格、导航及弹层。

## 安装

```ts
import { createApp } from 'vue'
import { MmdaApplication, setupI18n } from '@mmda/vui'
import {
  PrimeVueUiBuilder,
  PrimeVueOverlayHost,
  mmdaPrimeVue,
} from '@mmda/vui-primevue'
import 'primeicons/primeicons.css'

const app = createApp(Root)
const ui = new PrimeVueUiBuilder()
const i18n = setupI18n({}, 'zh')

// mmdaPrimeVue 已自动加载 Aura 主题、MMDA 布局样式与 Font Awesome（moduleIcon / far fa-*）
app
  .use(mmdaPrimeVue, { locale: 'zh' })
  .use(new MmdaApplication('/api', 'demo', ui, i18n))
  .mount('#app')
```

使用 PrimeVue `4.5.5` 和 PrimeIcons `7.x`。PrimeVue 5 已转为需要
PrimeUI 商业许可证的发行线，未配置许可证时会阻断应用渲染，因此本包
默认锁定最后的开源 PrimeVue 4 主线。

应用根组件不必再挂 Overlay Host：`MmdaApplication.install` 会把皮肤的 `overlayHost` 挂到 `document.body`。

## Font Awesome（菜单与业务图标）

后端 `Module.moduleIcon` 及 Logic 里大量 `far fa-*` 使用 Font Awesome，**不是** PrimeIcons。
字体在 `@mmda/vui`（`import '@mmda/vui/fontawesome.css'`）。皮肤插件会加载；兼容路径 `import '@mmda/vui-primevue/fontawesome.css'` 仍可用。

## 可选能力

- `BpmnModeler`：需要 `bpmn-js`
- `FilePreview`：DOCX/XLSX 需要 `@vue-office/docx` / `@vue-office/excel`
- `CodeImage`：需要 `qrcode` 或 `jsbarcode`
- factory 图表方法：需要 `chart.js`

这些包是 optional peer dependencies；只使用基础控件时不会进入默认 bundle。

## 边界

- 不实现或复制旧 `layoutOne` / `layoutTow`；页面使用 vui 的 `layoutPage`
- 不自行拼装查询请求；DataTable 仅通过 `filterModel` /
  `onFilterModelChange` 回写 `UiViewContext.searchParam.searchParams`
- `fieldMessage` 为 `false`，校验状态由 PrimeVue 控件和 `Message` 展示
- 不包含旧 Font Awesome 资源、Office Online、vuelidate 或 echarts
