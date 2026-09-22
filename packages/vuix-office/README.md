# @mmda/vuix-office

`@vue-office` 文件预览插件（docx / xlsx）。不依赖皮肤包。

```ts
import { createOfficePlugin } from '@mmda/vuix-office'

builder.use(createOfficePlugin())
```

`@vue-office/docx` / `@vue-office/excel` 是 optional peer；未安装时组件显示缺少依赖提示。
