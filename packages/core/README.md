# @mmda/core

元模型驱动架构的核心库。框架无关：Logic 是纯 TypeScript，不出现 Vue/React 类型。面向 Web 与小程序：用服务端下发的界面元数据生成实体、列表/编辑交互和 REST 访问。

当前版本 `1.2.0`。从 `@mmda/core` 一次导入即可。

```ts
import {
  MetaUi,
  MetaModel,
  MetaUiFieldLogic,
  OAuth2ApiClient,
  createDependencyContainer,
} from '@mmda/core'
```

## 分层

产品层是 **UI → Logic → Data**。core **没有 UI**。详见 [docs/index.md](./docs/index.md) 与仓库 [AGENTS.md](../../AGENTS.md)。

```text
UI     vui + 皮肤     配置与展现
Logic  core/logic     规范接口：只写交互
Data   core 其余      元数据 / MetaModel / API
```

- 先有 `MetaUi`，再用 `MetaModel` 创建和提交实体，最后用 Logic 跑一屏。
- `metaui` 不依赖 `logic`（`MetaUiService` 可依赖 net）。
- `models` 不依赖 `logic`。
- 会话态放在 `UiContext` / `MetaUiFieldLogic`，不要写回共享的 `MetaUiField`。引用硬限制用 `reference.where`；业务加码用 `refFilter`。

## 最小用法

```ts
const { metaui } = await metaUiService.getPack({ repository: 'Warehouses' })

const model = MetaModel.createEntity(metaui, defineWarehouse, source)
model.whName = '主仓'
MetaModel.modify(model)

const payload = MetaModel.savable(metaui, model, {
  ignoreProperties: ['actions'],
  ignoreNullish: true,
  ignoreDeeply: false,
  keepDirtyOnly: true,
})

await api.save(payload)

const name = new MetaUiFieldLogic(metaui.getField('whName')!)
name.lockIf((m) => !m.editable).required()
```

权限位用函数，不要挂 `Number.prototype`：

```ts
import { hasBit, ModuleOp, auth } from '@mmda/core'

hasBit(allowOp, ModuleOp.READ)
auth(ModuleOp.READ | ModuleOp.EXPORT)
```

日期区间筛选用 `dateTimeRange`。应用入口 `import '@mmda/core'` 会打 Date/String/Number/Array 补丁。

## 文档

设计说明目录：[docs/index.md](./docs/index.md)。HTTP 推荐 `FetchApi` + `OAuth2ApiClient` + `ApiProblem`（旧 `FetchClient` / `OAuthApiClient` / `ApiError` 已 deprecated）。

## 开发

仓库根目录，需要 Node `>=20.19`、pnpm `>=9`。

```bash
pnpm install
pnpm --filter @mmda/core test
pnpm --filter @mmda/core typecheck
pnpm --filter @mmda/core build
```
