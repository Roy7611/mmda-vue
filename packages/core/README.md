# @mmda/core

元模型驱动架构的核心库。框架无关，不依赖 Vue。面向 Web 与小程序：用服务端下发的界面元数据生成实体、列表/编辑交互和 REST 访问。

当前版本 `1.2.0`。从 `@mmda/core` 一次导入即可。

```ts
import {
  MetaUi,
  MetaModel,
  MetaUiFieldLogic,
  OAuthApiClient,
  createDependencyContainer,
} from '@mmda/core'
```

## 分层

```text
utils / extensions     无状态工具与原型补丁（最底层）
        ↓
     metaui            界面声明：字段、分组、过滤排序、按钮、元数据加载
        ↓
     models            按元数据长出的数据：Entity、MetaModel、分页、模块权限
        ↓
     logic             一屏交互：UiContext、Field/Group Logic、校验、搜索缓存
        ↓
     net / di          HTTP / OAuth / 依赖注入
```

约定：

- 先有 `MetaUi`，再用 `MetaModel` 创建和提交实体，最后用 `logic` 跑一屏。
- `metaui` 不依赖 `models` / `logic`（`MetaUiService` 可依赖 net，只负责拉元数据）。
- `models` 不依赖 `logic`。
- 会话态（搜索词、候选项、`filterFn`）放在 `UiContext` / `MetaUiFieldLogic`，不要写回共享的 `MetaUiField`。

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

日期区间筛选用 `dateTimeRange`；某个 `Date` 实例上的 `weekStart()` / `toSQL()` 见扩展文档。应用入口 `import '@mmda/core'` 会打 Date/String/Number/Array 补丁（`package.json` 的 `sideEffects`）。

## 文档

| 文档 | 内容 |
|---|---|
| [界面元数据](./docs/metaui.md) | `MetaUi` / Field / Group / Action / `MetaUiService` |
| [数据模型](./docs/models.md) | `Entity`、`MetaModel`、分页、`Module` |
| [前端交互逻辑](./docs/logic.md) | `UiContext`、Field/Group Logic、`FieldSearchOptions`、校验 |
| [HTTP / OAuth](./docs/net.md) | Fetch → 实体 REST → OAuth，错误为 `ApiError` |
| [依赖注入](./docs/dependency-injection.md) | token、生命周期；与 Vue provide/inject 的分工 |
| [工具函数](./docs/utils.md) | `is` / `localdb` / `pluralize` / `dateTimeRange` / 格式化 |
| [原型扩展](./docs/extensions.md) | Date/String 实例方法、`hasBit`、`toPrecise` |

新代码从 `@mmda/core` 顶层导入。下列源码路径仅兼容转发，后续会删：

- `metaui/metaui_logic`、`logic/metaui_logic` → `logic/ui_logic`
- `models/validation` → `logic/validation`
- `metaui/pagination` → `models/pagination`
- `MetaUiFieldOptions` → `FieldSearchOptions`

## 开发

仓库根目录，需要 Node `>=20.19`、pnpm `>=9`。

```bash
pnpm install
pnpm --filter @mmda/core test
pnpm --filter @mmda/core typecheck
pnpm --filter @mmda/core build
```
