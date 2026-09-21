# @mmda/core 重构决策记录

> 本文件记录 `@mmda/core` 分析后已落地与已否决的重构项，便于后续对齐，避免重复讨论。
> 产品分层真源仍以 [ARCHITECTURE.md](../../ARCHITECTURE.md) 为准。

## 已落地（高优先级）

### 1. 移除全局原型扩展，改为纯函数并并入 utils

- 不再给 `String` / `Array` / `Number` / `Date` 打补丁。
- 原 `extensions/` 已迁移为 `src/utils/`：
  - `string_extensions.ts` → `utils/string.ts`
  - `array_extensions.ts` → `utils/array.ts`
  - `number_extensions.ts` → `utils/number.ts`
  - `datetime_extensions.ts` → `utils/datetime.ts`
- 日期操作统一走 `DateUtils` / `tryParseDate`；位运算用 `hasBit`。

### 2. package.json sideEffects

- `packages/core/package.json` 的 `sideEffects` 已改为 `false`，不再保留 `./src/extensions/*.ts`。

### 3. HTTP 网络层收敛

- Logic 层（`EntityLogic.doAction`、`BomLogic`）不再引用 `ApiError`，统一用 `ApiProblem`。
- `FetchApiHttp` 的 HTTP 200 业务错误体也直接归一为 `ApiProblem`。
- 新增 `isApiProblemPayload`，`toApiProblem` 可直接解析旧业务错误体。
- `FetchClient` / `OAuthApiClient` / `ApiError` / `toApiError` 保留为 deprecated，待下游迁完后在下一主版本移除。

## 已否决 / 维持现状（中优先级）

### 1. `UiContext` 不拆分

保持单一 `UiContext` 契约，不按视图或职责拆分。

### 2. `EntityLogic` 不拆分

其中大量方法是 `apiClient` 的薄转发，后续还要在 `EntityLogic` 增加业务层错误处理。拆分会让程序员找不到入口，保持现状。

### 3. `MetaModel` 不拆分

`MetaModel` 是借助元数据操纵实体模型（model）的唯一入口。拆分会让调用链找不到主人，保持现状。

### 4. `field_logic` 与 `group_logic` 不合并

重新核对源码后确认二者不是重复实现：

- `MetaUiFieldLogic`（`logic/field_logic.ts`）是**字段粒度**逻辑：`lockIf` / `hideIf` / `requiredIf` / `onValidate` / `onChange` / `refWhere`。
- `MetaUiGroupLogic`（`logic/group_logic.ts`）是**子表组粒度**逻辑：`stdActions(add/clear)` / `itemDeletable` / `beforeItemRemove` / `beforeAdd` / `rowDetail` / `field()` 导航。
- `MetaUiGroupFieldLogic extends MetaUiFieldLogic`，子表字段逻辑是复用字段逻辑能力，而非重复实现。
- 两者仅 `lockIf` / `hideIf` / `lock` 三行式相近，但主人不同、语义不同（字段 vs 组），不抽公共类。

### 5. `buildGantt/Timeline/Scheduler/Kanban/Diagram` 不抽象

这些方法只是 index 视图构建的便捷出口，后续不会继续增加，不做泛化抽象。

## 后续

- 等下游迁完后，在下一主版本移除 deprecated 旧 HTTP 栈：`FetchClient` / `OAuthApiClient` / `ApiError` / `toApiError`。
- 可补架构门禁测试：Data 不得反向依赖 `logic/`；禁止新增 `declare global`。

## 低优先级 / 清理

- 删除 `models/entity.ts` 中大段注释掉的旧 `Entity` 类和过时的 ViewModel / 小程序 / Vue Options 文档。
- 收窄 `Validation` 索引签名：去掉 `string | number`，`summary` 与 `rowNum` 走显式成员。
- `ValueObject.value: any` → `unknown`（`any` 迁移第一刀）。
- 新增架构门禁测试 `src/__tests__/architecture_gate.test.ts`：Data 不反向依赖 logic、禁 `declare global`、Logic 保持纯 TS。
