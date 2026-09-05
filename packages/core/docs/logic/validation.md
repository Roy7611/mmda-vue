# logic/validation.ts

- **层**：Logic
- **源码**：packages/core/src/logic/validation.ts

## 职责

`$v` 状态树（`UiValidation` / `UiFieldValidation`）、`defineValidation`、`validateField` / `validateFieldResult`。

顺序：Required（`nullable` / `requiredFn` / 引用 `requiredNonZero`）→ `FieldLogic.validators`（元数据 + `onValidate`）。全部执行，按 `severity` 分拣：`message` 为 error（拦保存），`warning` 不计入 `errorNum`。

内置规则见 [validator.md](./validator.md)。用法 [validation_usage.md](./validation_usage.md)，设计 [validation_design.md](./validation_design.md)。实现在 `logic/validators/`。
