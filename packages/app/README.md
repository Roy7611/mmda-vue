# @mmda/app

BASE 与 MES 的统一应用壳和唯一生产部署入口。

```bash
pnpm --filter @mmda/app dev
pnpm --filter @mmda/app build
```

本包拥有唯一 Vue 根、Router、`MmdaApplication`、AppShell、登录和通用
EntityView；`@mmda/base` 与 `@mmda/mes` 通过插件贡献业务路由、API
service、Logic 和自定义页面。

详细设计见 [`../../docs/unified-app.md`](../../docs/unified-app.md)。
